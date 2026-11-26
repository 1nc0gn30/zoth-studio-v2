import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VERSION,
  LSYSTEM_PRESETS,
  LOGO_SAMPLES,
  expandLSystem,
  interpretLSystem,
  executeLogoDsl,
  optimizeToolpath2Opt,
  exportAutoFitGCode,
  exportThemeAwareSvg,
  rasterizeBraille,
} from '../src/utils/cyberTurtleEngine.js';

test('Studio CyberTurtle engine version & Pythagoras Tree 0/1 draw segments', () => {
  assert.equal(VERSION, '2.6.0');
  const pyth = LSYSTEM_PRESETS.find((p) => p.id === 'pythagoras');
  assert.ok(pyth);
  const exp = expandLSystem(pyth.axiom, pyth.rules, pyth.iter);
  const geo = interpretLSystem(exp, pyth.angle, 10);
  assert.ok(geo.stats.segments > 100);
});

test('Studio Logo DSL executes Flower of Life, recursive Koch if/stop, and enforces DoS caps', () => {
  const flower = executeLogoDsl(LOGO_SAMPLES.find((s) => s.id === 'flower').code);
  assert.ok(flower.stats.segments >= 192);
  const koch = executeLogoDsl(LOGO_SAMPLES.find((s) => s.id === 'koch_logo').code);
  assert.equal(koch.stats.segments, 3 * 4 ** 3);
  assert.throws(() => executeLogoDsl('to f f end f'), /recursion/i);
  assert.throws(() => executeLogoDsl('repeat 999999 [ fd 1 ]'), /out of bounds/i);
  assert.throws(() => expandLSystem('F', { F: 'FF' }, 20), /out of bounds/i);
});

test('Studio 2-Opt TSP reduces rapid air travel and G-Code gates pen-up moves + clamps 200mm bed', () => {
  const segs = [
    { x1: -400, y1: -200, x2: -380, y2: -200, is_draw: true },
    { x1: 300, y1: 300, x2: 320, y2: 300, is_draw: true },
    { x1: -375, y1: -200, x2: -355, y2: -200, is_draw: true },
    { x1: 280, y1: 300, x2: 295, y2: 300, is_draw: true },
  ];
  const opt = optimizeToolpath2Opt(segs);
  assert.ok(opt.optimizedAirTravel < opt.initialAirTravel);
  assert.ok(opt.savedMm > 400);

  const gcode = exportAutoFitGCode(opt.segments, { bedWidth: 200, bedHeight: 200 });
  assert.ok(gcode.includes('G21') && gcode.includes('G0 Z5.000'));
  for (const line of gcode.split('\n')) {
    const m = line.match(/X(-?\d+\.\d+)\s+Y(-?\d+\.\d+)/);
    if (m) {
      const xv = parseFloat(m[1]);
      const yv = parseFloat(m[2]);
      assert.ok(xv >= 0 && xv <= 200, `X out of 200mm bed: ${xv}`);
      assert.ok(yv >= 0 && yv <= 200, `Y out of 200mm bed: ${yv}`);
    }
  }
});

test('Studio SVG is theme-aware + XSS-escaped and Braille rasterizer emits real U+2800 glyphs', () => {
  const geo = executeLogoDsl('repeat 4 [ fd 60 rt 90 ]');
  const svgLight = exportThemeAwareSvg(geo, { isDark: false, title: 'A"><script>alert(1)</script>', stroke: 'red"/><script>' });
  assert.ok(svgLight.includes('#FAF8F3'));
  assert.ok(!svgLight.toLowerCase().includes('<script>'));

  const braille = rasterizeBraille(geo.segments, 32, 12);
  assert.ok(/[\u2801-\u28ff]/.test(braille));
});
