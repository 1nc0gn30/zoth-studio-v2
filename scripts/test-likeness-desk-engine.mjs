import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_MOUTH_ROI,
  LIKENESS_MCP_TOOLS,
  validateMouthRoi,
  clampMouthRoi,
  formatPipelineTelemetry,
  buildSpeakCliCommand,
  buildMcpToolCall,
} from '../src/utils/likenessDeskEngine.js';

test('validateMouthRoi accepts valid in-bounds coordinates', () => {
  const res = validateMouthRoi({ x: 0.38, y: 0.62, w: 0.24, h: 0.14 });
  assert.equal(res.valid, true);
  assert.equal(res.error, null);
  assert.deepEqual(res.roi, { x: 0.38, y: 0.62, w: 0.24, h: 0.14 });
});

test('validateMouthRoi rejects out-of-bounds x+w > 1 or y+h > 1', () => {
  const res = validateMouthRoi({ x: 0.9, y: 0.9, w: 0.5, h: 0.5 });
  assert.equal(res.valid, false);
  assert.match(res.error, /frame bounds/i);
});

test('validateMouthRoi rejects undersized width or height', () => {
  assert.equal(validateMouthRoi({ x: 0.4, y: 0.5, w: 0.02, h: 0.1 }).valid, false);
  assert.equal(validateMouthRoi({ x: 0.4, y: 0.5, w: 0.2, h: 0.01 }).valid, false);
});

test('validateMouthRoi rejects non-finite or negative values', () => {
  assert.equal(validateMouthRoi({ x: -0.1, y: 0.5, w: 0.2, h: 0.1 }).valid, false);
  assert.equal(validateMouthRoi({ x: Number.NaN, y: 0.5, w: 0.2, h: 0.1 }).valid, false);
});

test('clampMouthRoi clamps oversized ROI safely inside [0, 1]', () => {
  const clamped = clampMouthRoi({ x: 0.9, y: 0.92, w: 0.5, h: 0.5 });
  assert.ok(clamped.x + clamped.w <= 1.0001);
  assert.ok(clamped.y + clamped.h <= 1.0001);
  assert.ok(clamped.w >= 0.04);
  assert.ok(clamped.h >= 0.03);
});

test('formatPipelineTelemetry returns honest offline defaults when daemon unreachable', () => {
  const snap = formatPipelineTelemetry(null, false);
  assert.equal(snap.online, false);
  assert.equal(snap.modeLabel, 'OFFLINE');
  assert.deepEqual(snap.mouth, DEFAULT_MOUTH_ROI);
});

test('formatPipelineTelemetry reflects lazy_gpu and optional xAI chat truthfully', () => {
  const snap = formatPipelineTelemetry({
    mode: 'lazy_gpu',
    lazyGpu: true,
    voiceTrained: true,
    voiceSeconds: 16.7,
    face: true,
    motion: true,
    faceGpuName: 'NVIDIA Quadro P1000',
    chat: false,
    mouth: { x: 0.4, y: 0.6, w: 0.2, h: 0.12 },
  }, true);
  assert.equal(snap.online, true);
  assert.equal(snap.modeLabel, 'LAZY GPU PREVIEW');
  assert.match(snap.voiceLabel, /16\.7s/);
  assert.match(snap.egressLabel, /Local-Only/);
});

test('buildSpeakCliCommand escapes single quotes safely', () => {
  const cmd = buildSpeakCliCommand("Don't leak biometrics", 9395);
  assert.equal(cmd, "likeness-desk speak 'Don'\\''t leak biometrics'");
});

test('buildSpeakCliCommand includes custom port flag when non-default', () => {
  const cmd = buildSpeakCliCommand('Hello', 9400);
  assert.match(cmd, /--port 9400$/);
});

test('buildMcpToolCall accepts canonical 4 MCP tools and rejects phantom names', () => {
  assert.deepEqual(LIKENESS_MCP_TOOLS, [
    'likeness_status',
    'likeness_mouth_roi',
    'likeness_speak',
    'likeness_diagnostics',
  ]);
  const req = buildMcpToolCall('likeness_status', {}, 7);
  assert.equal(req.jsonrpc, '2.0');
  assert.equal(req.params.name, 'likeness_status');
  assert.throws(() => buildMcpToolCall('likeness_desk_execute'), /Unsupported MCP tool/);
});
