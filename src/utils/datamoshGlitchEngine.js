/**
 * Datamosh Glitch Studio v2.6.0 — Deterministic Pure-JS Pixel, Bitplane & JPEG Byte-Bend Engine
 * Shared by Zoth Studio v2 DatamoshGlitchGodModeTool and unit-tested via scripts/test-datamosh-engine.mjs.
 */

export const DATAMOSH_VERSION = '2.6.0';

export const GLITCH_PRESETS = [
  {
    id: 'h264_iframe_drop',
    name: 'H.264 I-Frame Drop',
    desc: 'Keyframe drop simulation with macroblock slice drag and chromatic convergence split.',
    sliceHeight: 18,
    shiftMax: 36,
    rgbSplit: 6,
    scanIntensity: 15,
    pixelSort: false,
    pixelSortLow: 50,
    pixelSortHigh: 220,
    pixelSortDir: 'row',
    jpegBend: false,
    jpegIntensity: 18,
    bitplaneEnabled: false,
    keepBits: [7, 6, 5, 4, 3, 2, 1, 0],
    invertBits: [],
    bitplaneChannel: 'all',
    sierpinskiEnabled: false,
    sierpinskiFormula: 'xor',
    sierpinskiScale: 1.0,
    sierpinskiBlend: 0.45,
  },
  {
    id: 'cyberpunk_vcr',
    name: 'Cyberpunk VCR Tracking',
    desc: 'Magnetic tape head tracking roll, horizontal sync shear, and heavy CRT scanlines.',
    sliceHeight: 6,
    shiftMax: 48,
    rgbSplit: 14,
    scanIntensity: 60,
    pixelSort: false,
    pixelSortLow: 50,
    pixelSortHigh: 220,
    pixelSortDir: 'row',
    jpegBend: false,
    jpegIntensity: 20,
    bitplaneEnabled: false,
    keepBits: [7, 6, 5, 4, 3, 2, 1, 0],
    invertBits: [],
    bitplaneChannel: 'all',
    sierpinskiEnabled: false,
    sierpinskiFormula: 'xor',
    sierpinskiScale: 1.0,
    sierpinskiBlend: 0.4,
  },
  {
    id: 'rgb_split_overdrive',
    name: 'RGB Chromatic Overdrive',
    desc: 'Wide red and blue channel horizontal separation with moderate macroblock displacement.',
    sliceHeight: 12,
    shiftMax: 16,
    rgbSplit: 24,
    scanIntensity: 20,
    pixelSort: false,
    pixelSortLow: 50,
    pixelSortHigh: 220,
    pixelSortDir: 'row',
    jpegBend: false,
    jpegIntensity: 16,
    bitplaneEnabled: false,
    keepBits: [7, 6, 5, 4, 3, 2, 1, 0],
    invertBits: [],
    bitplaneChannel: 'all',
    sierpinskiEnabled: false,
    sierpinskiFormula: 'xor',
    sierpinskiScale: 1.0,
    sierpinskiBlend: 0.4,
  },
  {
    id: 'pixel_sort_melt',
    name: 'Luminance Pixel Sort',
    desc: 'Rec.601 luminance threshold interval sorting across horizontal or vertical spans.',
    sliceHeight: 14,
    shiftMax: 18,
    rgbSplit: 6,
    scanIntensity: 12,
    pixelSort: true,
    pixelSortLow: 45,
    pixelSortHigh: 225,
    pixelSortDir: 'row',
    jpegBend: false,
    jpegIntensity: 12,
    bitplaneEnabled: false,
    keepBits: [7, 6, 5, 4, 3, 2, 1, 0],
    invertBits: [],
    bitplaneChannel: 'all',
    sierpinskiEnabled: false,
    sierpinskiFormula: 'xor',
    sierpinskiScale: 1.0,
    sierpinskiBlend: 0.4,
  },
  {
    id: 'bitplane_solarizer',
    name: '8-Bitplane Solarizer',
    desc: 'True 8-bit channel bitplane mask preserving MSBs [7,6,5] and inverting Bit 7.',
    sliceHeight: 14,
    shiftMax: 22,
    rgbSplit: 8,
    scanIntensity: 22,
    pixelSort: false,
    pixelSortLow: 50,
    pixelSortHigh: 220,
    pixelSortDir: 'row',
    jpegBend: false,
    jpegIntensity: 15,
    bitplaneEnabled: true,
    keepBits: [7, 6, 5],
    invertBits: [7],
    bitplaneChannel: 'all',
    sierpinskiEnabled: false,
    sierpinskiFormula: 'xor',
    sierpinskiScale: 1.0,
    sierpinskiBlend: 0.5,
  },
  {
    id: 'sierpinski_quantum',
    name: 'Sierpinski XOR Matrix',
    desc: 'Spatial coordinate boolean (x XOR y) fractal interference combined with slice tear.',
    sliceHeight: 20,
    shiftMax: 30,
    rgbSplit: 10,
    scanIntensity: 18,
    pixelSort: false,
    pixelSortLow: 50,
    pixelSortHigh: 220,
    pixelSortDir: 'row',
    jpegBend: false,
    jpegIntensity: 20,
    bitplaneEnabled: false,
    keepBits: [7, 6, 5, 4, 3, 2, 1, 0],
    invertBits: [],
    bitplaneChannel: 'all',
    sierpinskiEnabled: true,
    sierpinskiFormula: 'xor',
    sierpinskiScale: 1.5,
    sierpinskiBlend: 0.55,
  },
];

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export function createRng(seed) {
  let a = (Number(seed) || 1337) >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function luminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function applySliceShift(rgba, width, height, opts = {}) {
  const sliceHeight = clamp(Math.round(opts.sliceHeight || 16), 2, 128);
  const shiftMax = clamp(Math.round(opts.shiftMax || 0), 0, 200);
  if (shiftMax <= 0) return new Uint8ClampedArray(rgba);

  const rng = createRng(opts.seed ?? 42);
  const out = new Uint8ClampedArray(rgba);
  for (let y = 0; y < height; y += sliceHeight) {
    if (rng() < 0.72) {
      const shift = Math.floor((rng() * 2 - 1) * shiftMax);
      if (shift === 0) continue;
      const yEnd = Math.min(height, y + sliceHeight);
      for (let sy = y; sy < yEnd; sy++) {
        const rowOff = sy * width * 4;
        for (let sx = 0; sx < width; sx++) {
          const tx = (((sx + shift) % width) + width) % width;
          const src = rowOff + sx * 4;
          const dst = rowOff + tx * 4;
          out[dst] = rgba[src];
          out[dst + 1] = rgba[src + 1];
          out[dst + 2] = rgba[src + 2];
          out[dst + 3] = rgba[src + 3];
        }
      }
    }
  }
  return out;
}

export function applyRgbSplit(rgba, width, height, rgbSplit = 0) {
  const split = clamp(Math.round(rgbSplit || 0), 0, 64);
  if (split <= 0) return new Uint8ClampedArray(rgba);
  const out = new Uint8ClampedArray(rgba);
  for (let y = 0; y < height; y++) {
    const rowOff = y * width * 4;
    for (let x = 0; x < width; x++) {
      const rx = (x + split) % width;
      const bx = (x - split + width) % width;
      const idx = rowOff + x * 4;
      out[idx] = rgba[rowOff + rx * 4];
      out[idx + 2] = rgba[rowOff + bx * 4 + 2];
    }
  }
  return out;
}

export function applyScanlines(rgba, width, height, scanIntensity = 0) {
  const intensity = clamp(Number(scanIntensity || 0), 0, 100);
  if (intensity <= 0) return new Uint8ClampedArray(rgba);
  const out = new Uint8ClampedArray(rgba);
  const factor = 1 - intensity / 100;
  for (let y = 0; y < height; y += 3) {
    const start = y * width * 4;
    const end = start + width * 4;
    for (let i = start; i < end; i += 4) {
      out[i] = Math.round(out[i] * factor);
      out[i + 1] = Math.round(out[i + 1] * factor);
      out[i + 2] = Math.round(out[i + 2] * factor);
    }
  }
  return out;
}

export function applyPixelSort(rgba, width, height, opts = {}) {
  const low = clamp(Number(opts.thresholdLow ?? 50), 0, 254);
  const high = clamp(Number(opts.thresholdHigh ?? 220), low + 1, 255);
  const direction = opts.direction === 'column' ? 'column' : 'row';
  const out = new Uint8ClampedArray(rgba);

  if (direction === 'row') {
    for (let y = 0; y < height; y++) {
      let x = 0;
      while (x < width) {
        const i0 = (y * width + x) * 4;
        const l0 = luminance(out[i0], out[i0 + 1], out[i0 + 2]);
        if (l0 < low || l0 > high) {
          x++;
          continue;
        }
        const span = [];
        const startX = x;
        while (x < width) {
          const idx = (y * width + x) * 4;
          const l = luminance(out[idx], out[idx + 1], out[idx + 2]);
          if (l < low || l > high) break;
          span.push([out[idx], out[idx + 1], out[idx + 2], out[idx + 3], l]);
          x++;
        }
        if (span.length > 1) {
          span.sort((a, b) => a[4] - b[4]);
          for (let k = 0; k < span.length; k++) {
            const dst = (y * width + startX + k) * 4;
            out[dst] = span[k][0];
            out[dst + 1] = span[k][1];
            out[dst + 2] = span[k][2];
            out[dst + 3] = span[k][3];
          }
        }
      }
    }
  } else {
    for (let x = 0; x < width; x++) {
      let y = 0;
      while (y < height) {
        const i0 = (y * width + x) * 4;
        const l0 = luminance(out[i0], out[i0 + 1], out[i0 + 2]);
        if (l0 < low || l0 > high) {
          y++;
          continue;
        }
        const span = [];
        const startY = y;
        while (y < height) {
          const idx = (y * width + x) * 4;
          const l = luminance(out[idx], out[idx + 1], out[idx + 2]);
          if (l < low || l > high) break;
          span.push([out[idx], out[idx + 1], out[idx + 2], out[idx + 3], l]);
          y++;
        }
        if (span.length > 1) {
          span.sort((a, b) => a[4] - b[4]);
          for (let k = 0; k < span.length; k++) {
            const dst = ((startY + k) * width + x) * 4;
            out[dst] = span[k][0];
            out[dst + 1] = span[k][1];
            out[dst + 2] = span[k][2];
            out[dst + 3] = span[k][3];
          }
        }
      }
    }
  }
  return out;
}

export function applyBitplaneSlice(rgba, width, height, opts = {}) {
  const keepBits = Array.isArray(opts.keepBits) ? opts.keepBits : [7, 6, 5];
  const invertBits = Array.isArray(opts.invertBits) ? opts.invertBits : [];
  const ch = String(opts.channel || 'all').toLowerCase();

  let keepMask = 0;
  for (const b of keepBits) {
    const bi = Number(b);
    if (Number.isInteger(bi) && bi >= 0 && bi <= 7) keepMask |= 1 << bi;
  }
  let invertMask = 0;
  for (const b of invertBits) {
    const bi = Number(b);
    if (Number.isInteger(bi) && bi >= 0 && bi <= 7) invertMask |= 1 << bi;
  }

  const out = new Uint8ClampedArray(rgba);
  const total = width * height * 4;
  for (let i = 0; i < total; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    if (ch === 'luminance') {
      const lum = Math.round(luminance(r, g, b));
      const val = (lum & keepMask) ^ invertMask;
      out[i] = val;
      out[i + 1] = val;
      out[i + 2] = val;
    } else {
      if (ch === 'all' || ch === 'r') out[i] = (r & keepMask) ^ invertMask;
      if (ch === 'all' || ch === 'g') out[i + 1] = (g & keepMask) ^ invertMask;
      if (ch === 'all' || ch === 'b') out[i + 2] = (b & keepMask) ^ invertMask;
    }
  }
  return out;
}

export function applySierpinskiXor(rgba, width, height, opts = {}) {
  const formula = String(opts.formula || 'xor').toLowerCase();
  const scale = clamp(Number(opts.scale ?? 1.0), 0.1, 8.0);
  const blend = clamp(Number(opts.blend ?? 0.5), 0.0, 1.0);
  const out = new Uint8ClampedArray(rgba);

  for (let y = 0; y < height; y++) {
    const sy = Math.floor(y * scale);
    for (let x = 0; x < width; x++) {
      const sx = Math.floor(x * scale);
      let pat;
      if (formula === 'and') pat = (sx & sy) & 255;
      else if (formula === 'or') pat = (sx | sy) & 255;
      else if (formula === 'xor_and') pat = ((sx ^ sy) & (sx + sy)) & 255;
      else pat = (sx ^ sy) & 255;

      const i = (y * width + x) * 4;
      out[i] = Math.round((1 - blend) * out[i] + blend * (out[i] ^ pat));
      out[i + 1] = Math.round((1 - blend) * out[i + 1] + blend * (out[i + 1] ^ pat));
      out[i + 2] = Math.round((1 - blend) * out[i + 2] + blend * (out[i + 2] ^ pat));
    }
  }
  return out;
}

export function findJpegSosOffset(bytes) {
  if (!bytes || bytes.length < 16) return -1;
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return -1;
  let pos = 2;
  while (pos + 4 < bytes.length) {
    if (bytes[pos] !== 0xff) {
      pos++;
      continue;
    }
    while (pos < bytes.length && bytes[pos] === 0xff) pos++;
    if (pos >= bytes.length) break;
    const marker = bytes[pos];
    pos++;
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      continue;
    }
    if (pos + 1 >= bytes.length) break;
    const segLen = (bytes[pos] << 8) | bytes[pos + 1];
    if (segLen < 2) break;
    if (marker === 0xda) return pos + segLen;
    pos += segLen;
  }
  return -1;
}

export function corruptJpegBytes(jpegBytes, opts = {}) {
  const out = new Uint8Array(jpegBytes);
  const scanStart = findJpegSosOffset(out);
  if (scanStart < 0 || scanStart >= out.length - 4) {
    return { bytes: out, scanStart, mutatedCount: 0, headerPreserved: true };
  }
  let scanEnd = out.length - 2;
  for (let i = out.length - 2; i > scanStart; i--) {
    if (out[i] === 0xff && out[i + 1] === 0xd9) {
      scanEnd = i;
      break;
    }
  }
  const span = scanEnd - scanStart;
  if (span <= 8) {
    return { bytes: out, scanStart, scanEnd, mutatedCount: 0, headerPreserved: true };
  }
  const intensity = clamp(Number(opts.intensity ?? 20), 1, 100);
  const rng = createRng(opts.seed ?? 99);
  const targetFlips = Math.max(
    1,
    Math.min(Math.floor(span * 0.03), Math.round((intensity / 100) * Math.min(48, span / 4)))
  );
  let mutatedCount = 0;

  for (let k = 0; k < targetFlips * 3 && mutatedCount < targetFlips; k++) {
    const idx = scanStart + 2 + Math.floor(rng() * (span - 4));
    if (out[idx] === 0xff || out[idx - 1] === 0xff || out[idx + 1] === 0xff) continue;
    let nextVal = (out[idx] ^ (1 + Math.floor(rng() * 0xfe))) & 0xff;
    if (nextVal === 0xff) nextVal = 0xfe;
    if (nextVal !== out[idx]) {
      out[idx] = nextVal;
      mutatedCount++;
    }
  }

  return {
    bytes: out,
    scanStart,
    scanEnd,
    mutatedCount,
    headerPreserved: out[0] === 0xff && out[1] === 0xd8 && out[scanEnd] === 0xff && out[scanEnd + 1] === 0xd9,
  };
}

export function estimateMotionVectors(refRgba, tgtRgba, width, height, opts = {}) {
  const bs = clamp(Math.round(opts.blockSize || 24), 8, 64);
  const sr = clamp(Math.round(opts.searchRange || 6), 2, 16);
  const vectors = [];
  let totalMag = 0;

  for (let y = 0; y < height; y += bs) {
    for (let x = 0; x < width; x += bs) {
      const bw = Math.min(bs, width - x);
      const bh = Math.min(bs, height - y);
      let bestDx = 0;
      let bestDy = 0;
      let bestSad = Infinity;

      for (let dy = -sr; dy <= sr; dy += 2) {
        const cy = y + dy;
        if (cy < 0 || cy + bh > height) continue;
        for (let dx = -sr; dx <= sr; dx += 2) {
          const cx = x + dx;
          if (cx < 0 || cx + bw > width) continue;
          let sad = 0;
          for (let by = 0; by < bh; by += 4) {
            const tRow = (y + by) * width * 4;
            const rRow = (cy + by) * width * 4;
            for (let bx = 0; bx < bw; bx += 4) {
              const ti = tRow + (x + bx) * 4;
              const ri = rRow + (cx + bx) * 4;
              sad +=
                Math.abs(tgtRgba[ti] - refRgba[ri]) +
                Math.abs(tgtRgba[ti + 1] - refRgba[ri + 1]) +
                Math.abs(tgtRgba[ti + 2] - refRgba[ri + 2]);
            }
          }
          if (sad < bestSad) {
            bestSad = sad;
            bestDx = dx;
            bestDy = dy;
            if (sad === 0) break;
          }
        }
        if (bestSad === 0) break;
      }
      totalMag += Math.hypot(bestDx, bestDy);
      vectors.push({ mbX: x, mbY: y, dx: bestDx, dy: bestDy, sad: bestSad });
    }
  }

  return {
    width,
    height,
    blockSize: bs,
    totalBlocks: vectors.length,
    averageMagnitude: vectors.length ? Number((totalMag / vectors.length).toFixed(3)) : 0,
    vectors,
  };
}

export function applyPipeline(rgba, width, height, params = {}) {
  let buf = new Uint8ClampedArray(rgba);
  if (params.pixelSort) {
    buf = applyPixelSort(buf, width, height, {
      thresholdLow: params.pixelSortLow,
      thresholdHigh: params.pixelSortHigh,
      direction: params.pixelSortDir,
    });
  }
  if (params.shiftMax > 0) {
    buf = applySliceShift(buf, width, height, {
      sliceHeight: params.sliceHeight,
      shiftMax: params.shiftMax,
      seed: params.seed,
    });
  }
  if (params.rgbSplit > 0) {
    buf = applyRgbSplit(buf, width, height, params.rgbSplit);
  }
  if (params.bitplaneEnabled) {
    buf = applyBitplaneSlice(buf, width, height, {
      keepBits: params.keepBits,
      invertBits: params.invertBits,
      channel: params.bitplaneChannel,
    });
  }
  if (params.sierpinskiEnabled) {
    buf = applySierpinskiXor(buf, width, height, {
      formula: params.sierpinskiFormula,
      scale: params.sierpinskiScale,
      blend: params.sierpinskiBlend,
    });
  }
  if (params.scanIntensity > 0) {
    buf = applyScanlines(buf, width, height, params.scanIntensity);
  }
  return buf;
}

export function serializePreset(state = {}) {
  const clean = {
    schema: `datamosh-glitch-studio/preset@${DATAMOSH_VERSION}`,
    name: String(state.name || 'Custom Datamosh Preset').slice(0, 64),
    sliceHeight: clamp(Math.round(Number(state.sliceHeight) || 18), 2, 128),
    shiftMax: clamp(Math.round(Number(state.shiftMax) || 0), 0, 200),
    rgbSplit: clamp(Math.round(Number(state.rgbSplit) || 0), 0, 64),
    scanIntensity: clamp(Math.round(Number(state.scanIntensity) || 0), 0, 100),
    fps: clamp(Math.round(Number(state.fps) || 12), 1, 30),
    pixelSort: Boolean(state.pixelSort),
    pixelSortLow: clamp(Math.round(Number(state.pixelSortLow ?? 50)), 0, 254),
    pixelSortHigh: clamp(Math.round(Number(state.pixelSortHigh ?? 220)), 1, 255),
    pixelSortDir: state.pixelSortDir === 'column' ? 'column' : 'row',
    jpegBend: Boolean(state.jpegBend),
    jpegIntensity: clamp(Math.round(Number(state.jpegIntensity ?? 18)), 1, 100),
    bitplaneEnabled: Boolean(state.bitplaneEnabled),
    keepBits: Array.isArray(state.keepBits)
      ? [...new Set(state.keepBits.map(Number).filter((b) => Number.isInteger(b) && b >= 0 && b <= 7))].sort((a, b) => b - a)
      : [7, 6, 5],
    invertBits: Array.isArray(state.invertBits)
      ? [...new Set(state.invertBits.map(Number).filter((b) => Number.isInteger(b) && b >= 0 && b <= 7))].sort((a, b) => b - a)
      : [],
    bitplaneChannel: ['all', 'r', 'g', 'b', 'luminance'].includes(String(state.bitplaneChannel))
      ? String(state.bitplaneChannel)
      : 'all',
    sierpinskiEnabled: Boolean(state.sierpinskiEnabled),
    sierpinskiFormula: ['xor', 'and', 'or', 'xor_and'].includes(String(state.sierpinskiFormula))
      ? String(state.sierpinskiFormula)
      : 'xor',
    sierpinskiScale: Number(clamp(Number(state.sierpinskiScale ?? 1.0), 0.1, 8.0).toFixed(2)),
    sierpinskiBlend: Number(clamp(Number(state.sierpinskiBlend ?? 0.5), 0.0, 1.0).toFixed(2)),
  };
  if (clean.pixelSortHigh <= clean.pixelSortLow) {
    clean.pixelSortHigh = Math.min(255, clean.pixelSortLow + 10);
  }
  return JSON.stringify(clean, null, 2);
}

export function parsePresetJson(rawJson) {
  let parsed;
  try {
    parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
  } catch {
    throw new Error('Invalid JSON preset file');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Preset JSON must be an object');
  }
  return JSON.parse(serializePreset(parsed));
}
