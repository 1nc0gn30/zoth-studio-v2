/**
 * Acceptance test: sovereign visual primitives.
 *
 * Run: node scripts/test-sovereign-primitives.mjs
 *
 * This exercises the REAL modules under src/components/sovereign/ against a
 * stub CanvasRenderingContext2D that:
 *   - records every fillText glyph so the braille encoder is checked cell by
 *     cell (not "a canvas was drawn, call it done");
 *   - records every numeric argument and FAILS on non-finite values, which is
 *     the usual way a canvas scene corrupts its own state and white-pages a
 *     route with "Failed to execute 'arc' ... not a number";
 *   - can simulate the browser details that matter: braille glyphs missing
 *     from the font (tofu risk), no document (SSR), and a tainted canvas where
 *     getImageData throws.
 */

import assert from 'node:assert/strict';
import {
  SOV, rgba, hashSeed, rng, VARIANTS, pickVariant, VARIANT_META, luma,
} from '../src/components/sovereign/palette.js';
import { BAYER8, bayer8, ditherFieldToRGBA } from '../src/components/sovereign/bayer.js';
import {
  DOT_BITS, cellChar, bitsFromDots, dotsFromBits, probeBrailleSupport, drawBrailleField,
} from '../src/components/sovereign/braille.js';
import { RENDERERS, getRenderer, sceneAccent } from '../src/components/sovereign/renderers.js';

let pass = 0;
const failures = [];
const ctxLog = { nonFinite: 0, samples: [] };

function check(name, fn) {
  try {
    fn();
    pass += 1;
  } catch (e) {
    failures.push(`${name}: ${e.message}`);
  }
}

function stubCtx({ brailleSupported = true, getImageDataThrows = false } = {}) {
  const calls = { fillText: [], fillRect: 0, strokes: 0, puts: 0, draws: 0 };
  const rec = (...args) => {
    for (const a of args) {
      if (typeof a === 'number' && !Number.isFinite(a)) {
        ctxLog.nonFinite += 1;
        if (ctxLog.samples.length < 5) ctxLog.samples.push(args.slice(0, 3));
      }
    }
  };
  const grad = () => ({ addColorStop: (...a) => rec(...a) });
  const ctx = {
    canvas: { width: 0, height: 0 },
    font: '10px monospace',
    textAlign: 'left',
    textBaseline: 'top',
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    imageSmoothingEnabled: true,
    measureText(s) {
      if (!brailleSupported) return { width: 6 };
      if (s === '\u28ff') return { width: 7.2 };
      if (s === '\u2800') return { width: 4.8 };
      return { width: 6 };
    },
    fillRect: (...a) => { rec(...a); calls.fillRect += 1; },
    clearRect: (...a) => rec(...a),
    fillText: (s, x, y) => { rec(x, y); calls.fillText.push([s, x, y]); },
    save() {}, restore() {}, beginPath() {}, closePath() {},
    moveTo: (...a) => rec(...a),
    lineTo: (...a) => rec(...a),
    arc: (...a) => rec(...a),
    ellipse: (...a) => rec(...a),
    stroke: () => { calls.strokes += 1; },
    fill() {},
    setTransform: (...a) => rec(...a),
    createRadialGradient: (...a) => { rec(...a); return grad(); },
    createLinearGradient: (...a) => { rec(...a); return grad(); },
    drawImage: (...a) => { rec(...a); calls.draws += 1; },
    getImageData(x, y, w, h) {
      rec(x, y, w, h);
      if (getImageDataThrows) throw new Error('SecurityError: tainted');
      return { data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h };
    },
    putImageData: () => { calls.puts += 1; },
    createImageData: (w, h) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h }),
  };
  return { ctx, calls };
}

/* -------------------------- palette -------------------------- */
check('palette: sovereign hexes are exactly the mandated values', () => {
  assert.equal(SOV.gold, '#D4AF37');
  assert.equal(SOV.emerald, '#34D399');
  assert.equal(SOV.cyber, '#38BDF8');
  assert.equal(SOV.obsidian, '#05060B');
  assert.equal(SOV.obsidian2, '#0A0D16');
});

check('palette: rgba() converts hex and survives junk', () => {
  assert.equal(rgba('#D4AF37', 0.5), 'rgba(212,175,55,0.5)');
  assert.equal(rgba('#0A0D16', 1), 'rgba(10,13,22,1)');
  assert.match(rgba('nonsense', 0.2), /^rgba\(212,175,55,0\.2\)$/);
  assert.match(rgba(null, 0.2), /^rgba\(212,175,55,0\.2\)$/);
});

check('palette: hashSeed is stable + deterministic', () => {
  assert.equal(hashSeed('zoth'), hashSeed('zoth'));
  assert.notEqual(hashSeed('zoth'), hashSeed('zoth '));
  assert.ok(hashSeed('') >= 0);
  assert.ok(Number.isInteger(hashSeed({ a: 1 })));
});

check('palette: rng is seeded, deterministic and in [0,1)', () => {
  const a = rng('seed');
  const b = rng('seed');
  const va = [a(), a(), a()];
  const vb = [b(), b(), b()];
  assert.deepEqual(va, vb);
  assert.ok(va.every((v) => v >= 0 && v < 1));
  assert.notDeepEqual(va, [rng('other')(), rng('other')(), rng('other')()]);
});

check('palette: pickVariant is deterministic and spreads all 4 primitives', () => {
  assert.equal(pickVariant('x'), pickVariant('x'));
  const ids = ['jwt-inspector', 'cert-path-roadmap', 'regex-droid', 'hexstrike-console', 'envguard-vault',
    'agent-flight-recorder', 'agent-budget-sentinel', 'payload-entropy', 'pod-smart-router', 'vision-gesture'];
  const seen = new Set(ids.map(pickVariant));
  assert.equal(seen.size, VARIANTS.length, `variants hit: ${[...seen].join(',')}`);
  ids.forEach((id) => assert.ok(VARIANT_META[pickVariant(id)], id));
});

check('palette: luma is Rec.709 ordered', () => {
  assert.ok(luma(0, 1, 0) > luma(1, 0, 0));
  assert.ok(luma(0, 0, 1) < luma(1, 0, 0));
  assert.equal(Math.round(luma(1, 1, 1) * 100) / 100, 1);
});

/* -------------------------- bayer -------------------------- */
check('bayer: matrix is the canonical 0..63 permutation', () => {
  assert.equal(BAYER8.length, 64);
  assert.deepEqual([...BAYER8].sort((a, b) => a - b), Array.from({ length: 64 }, (_, i) => i));
  assert.equal(bayer8(0, 0), 0);
  assert.equal(bayer8(1, 0), 32 / 64);
  assert.equal(BAYER8[0], 0);
  assert.equal(BAYER8[1], 32);
});

check('bayer: tiles every 8px and stays inside [0,1)', () => {
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const v = bayer8(x, y);
      assert.ok(v >= 0 && v < 1, `${x},${y} -> ${v}`);
      assert.equal(bayer8(x + 8, y + 24), v);
    }
  }
});

check('bayer: ordered dither of flat fields picks the right tone', () => {
  const w = 16;
  const h = 16;
  const out = new Uint8ClampedArray(w * h * 4);
  const opts = { low: SOV.obsidian2, high: SOV.gold };
  const lumaOf = (buf, i) => [buf[i * 4], buf[i * 4 + 1], buf[i * 4 + 2]].join(',');

  ditherFieldToRGBA(new Float32Array(w * h).fill(1), w, h, out, opts);
  const highKey = lumaOf(out, 0);
  assert.ok([...Array(w * h)].every((_, i) => lumaOf(out, i) === highKey), 'all-ones must be entirely the high tone');

  ditherFieldToRGBA(new Float32Array(w * h).fill(0), w, h, out, opts);
  const lowKey = lumaOf(out, 0);
  assert.notEqual(lowKey, highKey);

  ditherFieldToRGBA(new Float32Array(w * h).fill(0.5), w, h, out, opts);
  let hi = 0;
  for (let i = 0; i < w * h; i += 1) if (lumaOf(out, i) === highKey) hi += 1;
  const ratio = hi / (w * h);
  assert.ok(ratio > 0.35 && ratio < 0.65, `50% field dithered to ${(ratio * 100).toFixed(1)}% high`);
  assert.ok(hi > 0 && hi < w * h, 'a 50% field must produce a real mix');
});

check('bayer: mid-band accent tone is applied only inside the band', () => {
  const w = 24;
  const h = 8;
  const out = new Uint8ClampedArray(w * h * 4);
  ditherFieldToRGBA(new Float32Array(w * h).fill(0.66), w, h, out, {
    low: SOV.obsidian2, high: SOV.gold, mid: [SOV.emerald], midFrom: 0.6, midTo: 0.7,
  });
  const key = (i) => [out[i * 4], out[i * 4 + 1], out[i * 4 + 2]].join(',');
  assert.equal(key(0), '52,211,153', 'value inside the band must take the emerald accent');
  assert.equal(out[3], 255, 'alpha must be opaque');
});

/* -------------------------- braille -------------------------- */
check('braille: dot bit map matches the U+2800 spec', () => {
  assert.deepEqual(DOT_BITS[0], [0x01, 0x02, 0x04, 0x40]);
  assert.deepEqual(DOT_BITS[1], [0x08, 0x10, 0x20, 0x80]);
  assert.equal(cellChar(0), '\u2800');
  assert.equal(cellChar(1), '\u2801');
  assert.equal(cellChar(255), '\u28ff');
  assert.equal(cellChar(256), '\u2800', 'masks to a byte');
});

check('braille: every one of the 256 cells round-trips dots<->bits', () => {
  for (let bits = 0; bits < 256; bits += 1) {
    assert.equal(bitsFromDots(dotsFromBits(bits)), bits, `bits ${bits}`);
  }
  const dots = [[true, false], [false, true], [true, true], [false, false]];
  assert.equal(bitsFromDots(dots), 0x01 | 0x10 | 0x04 | 0x20);
});

check('braille: probe detects a font WITHOUT braille glyphs (tofu guard)', () => {
  const { ctx } = stubCtx({ brailleSupported: true });
  assert.equal(probeBrailleSupport(ctx, '9px monospace'), true);
  const { ctx: noBraille } = stubCtx({ brailleSupported: false });
  assert.equal(probeBrailleSupport(noBraille, '9px monospace'), false);
});

check('braille: saturated field encodes every lit cell as U+28FF', () => {
  const { ctx, calls } = stubCtx();
  const stats = drawBrailleField(ctx, {
    w: 96, h: 64, t: 0, cell: 8, sample: () => 1, colorAt: () => SOV.gold,
  });
  assert.equal(stats.glyphs, true);
  assert.equal(stats.cols, 20, `cols=${stats.cols}`);
  assert.equal(stats.rows, 8, `rows=${stats.rows}`);
  assert.equal(stats.lit, stats.cols * stats.rows);
  assert.equal(calls.fillText.length, stats.cols * stats.rows);
  assert.ok(calls.fillText.every(([ch]) => ch === '\u28ff'), 'every cell must be full braille');
  assert.equal((stats.lit * 8), stats.cells * 8, '8 sub-pixels per cell');
});

check('braille: an empty field draws nothing', () => {
  const { ctx, calls } = stubCtx();
  const stats = drawBrailleField(ctx, { w: 96, h: 64, t: 0, cell: 8, sample: () => 0 });
  assert.equal(stats.lit, 0);
  assert.equal(calls.fillText.length, 0);
});

check('braille: left-column-only field encodes exactly dots 1,2,3,7 (U+2847)', () => {
  const { ctx, calls } = stubCtx();
  const stats = drawBrailleField(ctx, {
    w: 96, h: 64, t: 0, cell: 8,
    // light only the left half of every cell
    sample: (x) => (Math.floor(x / 4.8) % 1 === 0 && (x % 4.8) < 2.4 ? 1 : 0),
  });
  assert.ok(stats.lit > 0);
  assert.ok(calls.fillText.every(([ch]) => ch === '\u2847'), `chars: ${[...new Set(calls.fillText.map((c) => c[0].codePointAt(0).toString(16)))].join(',')}`);
});

check('braille: without a braille-capable font it falls back to dot rectangles', () => {
  const { ctx, calls } = stubCtx({ brailleSupported: false });
  const stats = drawBrailleField(ctx, { w: 96, h: 64, t: 0, cell: 8, sample: () => 1 });
  assert.equal(stats.glyphs, false);
  assert.equal(calls.fillText.length, 0, 'no tofu glyphs may be emitted');
  assert.ok(calls.fillRect >= stats.lit * 8, `expected >= ${stats.lit * 8} dot rects, got ${calls.fillRect}`);
});

check('braille: forced dot mode ignores a capable font', () => {
  const { ctx, calls } = stubCtx({ brailleSupported: true });
  const stats = drawBrailleField(ctx, { w: 48, h: 32, t: 0, cell: 8, sample: () => 1, dots: true });
  assert.equal(stats.glyphs, false);
  assert.equal(calls.fillText.length, 0);
  assert.ok(calls.fillRect > 0);
});

check('braille: degenerate sizes do not throw or emit NaN', () => {
  const { ctx } = stubCtx();
  [1, 2, 4, 5].forEach((w) => {
    const s = drawBrailleField(ctx, { w, h: 3, t: 0, cell: 8, sample: () => 1 });
    assert.ok(s.cols >= 1 && s.rows >= 1);
  });
});

/* -------------------------- renderers -------------------------- */
check('renderers: registry exposes all four primitives', () => {
  VARIANTS.forEach((v) => assert.equal(typeof RENDERERS[v], 'function', v));
  assert.equal(getRenderer('nope'), RENDERERS['braille-orbit'], 'unknown variant falls back, never undefined');
  assert.equal(sceneAccent('a', 'braille-orbit'), SOV.gold);
  assert.equal(sceneAccent('a', 'bayer-field'), SOV.emerald);
});

check('renderers: every scene survives w/h=0 and tiny sizes without throwing', () => {
  const { ctx } = stubCtx();
  const envBase = { dpr: 1, t: 1.25, dt: 1 / 30, reduced: false, intensity: 1, seed: 12345, forceDots: false };
  VARIANTS.forEach((v) => {
    const r = getRenderer(v);
    assert.equal(r(ctx, { ...envBase, w: 0, h: 0 }), null, `${v} at 0x0 must return null`);
    [1, 3, 5, 9].forEach((s) => {
      assert.doesNotThrow(() => r(ctx, { ...envBase, w: s, h: s }), `${v} at ${s}px`);
    });
  });
});

check('renderers: full sweep at three viewports', () => {
  const viewports = [[390, 104], [834, 124], [1440, 148]]; // mobile / tablet / desktop
  const times = [0, 0.5, 1.75, 12.5];
  viewports.forEach(([w, h]) => {
    times.forEach((t) => {
      VARIANTS.forEach((v) => {
        const { ctx } = stubCtx();
        const stats = getRenderer(v)(ctx, {
          w, h, dpr: 2, t, dt: 1 / 30, reduced: false, intensity: 1, seed: 987, forceDots: false,
        });
        if (v !== 'bayer-field') {
          assert.ok(stats && typeof stats === 'object', `${v} @${w}x${h} t=${t} returned no stats`);
        }
      });
    });
  });
});

check('renderers: reduced motion still paints a single complete frame', () => {
  const created = [];
  global.document = {
    createElement(tag) {
      const s = stubCtx();
      const el = { tagName: tag, width: 0, height: 0, getContext: () => s.ctx };
      created.push({ el, ...s });
      return el;
    },
  };
  try {
    VARIANTS.forEach((v) => {
      const { ctx, calls } = stubCtx();
      getRenderer(v)(ctx, {
        w: 900, h: 148, dpr: 2, t: 4, dt: 1 / 30, reduced: true, intensity: 1, seed: 5, forceDots: false,
      });
      const painted = calls.fillRect + calls.fillText.length + calls.strokes + calls.draws
        + created.reduce((n, c) => n + c.calls.puts, 0);
      assert.ok(painted > 0, `${v} painted nothing under reduced motion`);
    });
  } finally {
    delete global.document;
  }
});

check('renderers: scanline tear path tolerates a SecurityError from getImageData', () => {
  let threw = null;
  try {
    for (let i = 0; i < 40; i += 1) {
      const { ctx } = stubCtx({ getImageDataThrows: true });
      getRenderer('scanline-grid')(ctx, {
        w: 320, h: 148, dpr: 1, t: i * 0.13, dt: 1 / 30, reduced: false, intensity: 1, seed: 3,
      });
    }
  } catch (e) {
    threw = e;
  }
  assert.equal(threw, null, `scanline-grid leaked ${threw && threw.message}`);
});

check('renderers: bayer field uses ordered dithering at half resolution', () => {
  // bayer needs document.createElement for the offscreen buffer; simulate it.
  const created = [];
  global.document = {
    createElement(tag) {
      const s = stubCtx();
      const el = { tagName: tag, width: 0, height: 0, getContext: () => s.ctx };
      created.push({ el, ...s });
      return el;
    },
  };
  try {
    const { ctx, calls } = stubCtx();
    const stats = getRenderer('bayer-field')(ctx, {
      w: 900, h: 148, dpr: 1, t: 2, dt: 1 / 30, reduced: false, intensity: 1, seed: 42,
    });
    assert.ok(stats && stats.cells > 0, 'bayer produced no stats');
    assert.equal(created.length, 1, 'one offscreen buffer, reused');
    assert.equal(created[0].el.width, Math.ceil(900 / 2));
    assert.equal(created[0].el.height, Math.ceil(148 / 2));
    assert.equal(created[0].calls.puts, 1, 'exactly one putImageData into the offscreen buffer per frame');
    assert.equal(created[0].calls.draws, 0, 'nothing is blitted into the offscreen buffer');
    assert.equal(calls.draws, 1, 'exactly one upscaled blit onto the visible canvas per frame');
    assert.equal(ctx.imageSmoothingEnabled, true, 'smoothing restored after the blit');

    // Same size again: the cache must be reused, not rebuilt.
    getRenderer('bayer-field')(ctx, { w: 900, h: 148, dpr: 1, t: 2.4, dt: 1 / 30, reduced: false, intensity: 1, seed: 42 });
    assert.equal(created.length, 1, 'buffer must be cached across frames');
    assert.equal(created[0].calls.puts, 2, 'the cached buffer is refilled, not reallocated');
  } finally {
    delete global.document;
  }
});

check('renderers: bayer degrades to null (no throw) in a document-less SSR pass', () => {
  assert.equal(typeof document, 'undefined');
  const { ctx } = stubCtx();
  assert.equal(getRenderer('bayer-field')(ctx, {
    w: 900, h: 148, dpr: 1, t: 2, dt: 1 / 30, reduced: false, intensity: 1, seed: 42,
  }), null);
});

check('renderers: no scene ever hands a non-finite number to the canvas', () => {
  const viewports = [[390, 104], [1440, 148], [1, 1]];
  viewports.forEach(([w, h]) => {
    for (let i = 0; i < 25; i += 1) {
      VARIANTS.forEach((v) => {
        const { ctx } = stubCtx();
        getRenderer(v)(ctx, {
          w, h, dpr: 2, t: i * 0.4, dt: i === 0 ? 0 : 1 / 30, reduced: false, intensity: 1, seed: i * 7,
        });
      });
    }
  });
  assert.equal(ctxLog.nonFinite, 0, `non-finite canvas args: ${ctxLog.nonFinite} (e.g. ${JSON.stringify(ctxLog.samples)})`);
});

/* -------------------------- report -------------------------- */
console.log(`sovereign primitives: ${pass} passed, ${failures.length} failed`);
if (failures.length) {
  failures.forEach((f) => console.log(`  FAIL ${f}`));
  process.exit(1);
}
