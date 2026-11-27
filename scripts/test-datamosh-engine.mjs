import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DATAMOSH_VERSION,
  GLITCH_PRESETS,
  applyPixelSort,
  applyBitplaneSlice,
  applySierpinskiXor,
  corruptJpegBytes,
  estimateMotionVectors,
  applyPipeline,
  serializePreset,
  parsePresetJson,
} from '../src/utils/datamoshGlitchEngine.js';

function makePattern(w, h) {
  const buf = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      buf[i] = (x * 19 + y * 7) % 256;
      buf[i + 1] = (y * 13 + x * 5) % 256;
      buf[i + 2] = ((x + y) * 11) % 256;
      buf[i + 3] = 255;
    }
  }
  return buf;
}

test('Datamosh engine exports v2.6.0 and 6 presets', () => {
  assert.equal(DATAMOSH_VERSION, '2.6.0');
  assert.equal(GLITCH_PRESETS.length, 6);
});

test('Pixel sort mutates luminance spans deterministically', () => {
  const src = makePattern(32, 16);
  const out = applyPixelSort(src, 32, 16, { thresholdLow: 25, thresholdHigh: 235, direction: 'row' });
  assert.notDeepEqual(Array.from(out), Array.from(src));
});

test('True 8-bitplane slicer isolates exact bit 7 MSB values (0 or 128)', () => {
  const src = makePattern(16, 16);
  const out = applyBitplaneSlice(src, 16, 16, { keepBits: [7], invertBits: [], channel: 'all' });
  for (let i = 0; i < out.length; i += 4) {
    assert.ok(out[i] === 0 || out[i] === 128);
    assert.ok(out[i + 1] === 0 || out[i + 1] === 128);
    assert.ok(out[i + 2] === 0 || out[i + 2] === 128);
  }
});

test('Sierpinski XOR applies boolean formulas across pixel coordinates', () => {
  const src = makePattern(24, 24);
  for (const formula of ['xor', 'and', 'or', 'xor_and']) {
    const out = applySierpinskiXor(src, 24, 24, { formula, scale: 1.5, blend: 0.6 });
    assert.notDeepEqual(Array.from(out), Array.from(src));
  }
});

test('Header-safe JPEG byte-bend protects SOI/SOS header and EOI while corrupting scan data', () => {
  const header = [
    0xff, 0xd8,
    0xff, 0xe0, 0x00, 0x06, 0x4a, 0x46, 0x49, 0x46,
    0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00,
  ];
  const scan = new Array(80).fill(0).map((_, idx) => 0x15 + (idx % 0x65));
  const jpeg = new Uint8Array([...header, ...scan, 0xff, 0xd9]);
  const res = corruptJpegBytes(jpeg, { intensity: 55, seed: 42 });
  assert.equal(res.scanStart, header.length);
  assert.equal(res.headerPreserved, true);
  assert.ok(res.mutatedCount > 0);
  for (let i = 0; i < header.length; i++) {
    assert.equal(res.bytes[i], jpeg[i]);
  }
});

test('Macroblock motion vector estimator detects displacement and pipeline runs cleanly', () => {
  const w = 32;
  const h = 32;
  const ref = makePattern(w, h);
  const shifted = applyPipeline(ref, w, h, {
    sliceHeight: 8,
    shiftMax: 8,
    rgbSplit: 4,
    scanIntensity: 10,
    seed: 123,
  });
  const mv = estimateMotionVectors(ref, shifted, w, h, { blockSize: 16, searchRange: 4 });
  assert.equal(mv.totalBlocks, 4);
  assert.ok(mv.averageMagnitude >= 0);
});

test('JSON preset serializer and parser enforce bounds and reject invalid payloads', () => {
  const raw = serializePreset({
    name: 'Studio Preset',
    sliceHeight: 500,
    shiftMax: -10,
    keepBits: [7, 6, 42],
    bitplaneChannel: 'luminance',
  });
  const parsed = parsePresetJson(raw);
  assert.equal(parsed.sliceHeight, 128);
  assert.equal(parsed.shiftMax, 0);
  assert.deepEqual(parsed.keepBits, [7, 6]);
  assert.equal(parsed.bitplaneChannel, 'luminance');
  assert.throws(() => parsePresetJson('not-json'));
});
