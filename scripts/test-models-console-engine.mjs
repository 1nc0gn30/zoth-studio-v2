import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  GPU_PRESETS,
  MODELS_CONSOLE_SCHEMA_VERSION,
  PROVIDER_DEFINITIONS,
  QUANTIZATION_PROFILES,
  buildOfflineModelsSnapshot,
  csvEscape,
  estimateGgufVramFit,
  formatModelsConsoleExports,
  normalizeModelsSnapshot,
  parseNvidiaSmiCsv,
  parseParameterSizeToBillions,
  redactModelsPayload,
  redactModelsText,
  sha256Hex,
  synthesizeModelCommands,
} from '../src/utils/modelsConsoleEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

test('1. Byte-identical parity between src/utils/modelsConsoleEngine.js and server/models-console-engine.mjs', () => {
  const browserSrc = fs.readFileSync(path.join(ROOT, 'src/utils/modelsConsoleEngine.js'));
  const serverSrc = fs.readFileSync(path.join(ROOT, 'server/models-console-engine.mjs'));
  assert.equal(Buffer.compare(browserSrc, serverSrc), 0, 'Browser and server models console engines must be byte-identical');
});

test('2. Pure engine invariants: zero eval, new Function, Math.random, or literal /home/<user> paths', () => {
  const src = fs.readFileSync(path.join(ROOT, 'src/utils/modelsConsoleEngine.js'), 'utf8');
  assert.doesNotMatch(src, /\beval\s*\(/);
  assert.doesNotMatch(src, /\bnew\s+Function\s*\(/);
  assert.doesNotMatch(src, /\bMath\.random\s*\(/);
  assert.doesNotMatch(src, /\/home\/[a-z0-9._-]+/i);
  assert.equal(MODELS_CONSOLE_SCHEMA_VERSION, '2.4.0');
  assert.equal(PROVIDER_DEFINITIONS.length, 5);
  assert.equal(QUANTIZATION_PROFILES.length, 5);
  assert.ok(GPU_PRESETS.some((g) => g.id === 'quadro-p1000-4g' && g.vramGiB === 4));
});

test('3. Synchronous FIPS 180-4 SHA-256 matches NIST test vectors', () => {
  assert.equal(
    sha256Hex(''),
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  );
  assert.equal(
    sha256Hex('abc'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
});

test('4. Parameter size parser handles B, M, K, and numeric inputs cleanly', () => {
  assert.equal(parseParameterSizeToBillions('8.0B'), 8);
  assert.equal(parseParameterSizeToBillions('494.03M'), 0.494);
  assert.equal(parseParameterSizeToBillions('1.5B'), 1.5);
  assert.equal(parseParameterSizeToBillions(7.25), 7.25);
  assert.equal(parseParameterSizeToBillions(''), null);
  assert.equal(parseParameterSizeToBillions(-4), null);
});

test('5. GGUF + KV-cache VRAM calculator: qwen2.5:1.5b Q4_K_M fits Quadro P1000 (4 GiB)', () => {
  const res = estimateGgufVramFit({
    paramsB: 1.54,
    quantization: 'Q4_K_M',
    contextLen: 8192,
    kvPrecision: 'FP16',
    gpuVramGiB: 4,
    layers: 28,
    kvHeads: 2,
    headDim: 128,
  });
  assert.equal(res.ok, true);
  assert.equal(res.verdict, 'FITS_VRAM');
  assert.equal(res.recommendedGpuLayers, 28);
  assert.ok(res.breakdown.weightMiB > 800 && res.breakdown.weightMiB < 1000);
  // KV cache = 2 * 28 * 2 * 128 * 8192 * 2 / 1024^2 = 224 MiB exact
  assert.equal(res.breakdown.kvCacheMiB, 224);
  assert.ok(res.breakdown.totalMiB < 4096);
  assert.ok(res.maxContextAtBudget > 8192);
  assert.equal(res.quantMatrix.length, 5);
  assert.match(res.receiptSha256, /^[0-9a-f]{64}$/);
});

test('6. GGUF + KV-cache VRAM calculator: hermes3:8b Q4_0 on Quadro P1000 (4 GiB) triggers PARTIAL_CPU_OFFLOAD', () => {
  const res = estimateGgufVramFit({
    paramsB: 8.03,
    quantization: 'Q4_0',
    contextLen: 4096,
    kvPrecision: 'FP16',
    gpuVramGiB: 4,
    layers: 32,
    kvHeads: 8,
    headDim: 128,
  });
  assert.equal(res.ok, true);
  assert.equal(res.verdict, 'PARTIAL_CPU_OFFLOAD');
  assert.ok(res.recommendedGpuLayers > 0 && res.recommendedGpuLayers < 32);
  assert.ok(res.breakdown.totalMiB > 4096);
});

test('7. GGUF + KV-cache VRAM calculator: llama3.3:70b Q8_0 on Quadro P1000 (4 GiB) triggers EXCEEDS_BUDGET', () => {
  const res = estimateGgufVramFit({
    paramsB: 70.6,
    quantization: 'Q8_0',
    contextLen: 8192,
    kvPrecision: 'FP16',
    gpuVramGiB: 4,
    layers: 80,
    kvHeads: 8,
    headDim: 128,
  });
  assert.equal(res.ok, true);
  assert.equal(res.verdict, 'EXCEEDS_BUDGET');
  assert.ok(res.breakdown.totalGiB > 65);
});

test('8. Estimator rejects invalid params, unsupported quants, and out-of-range context/GPU cleanly', () => {
  assert.equal(estimateGgufVramFit({ paramsB: 0 }).ok, false);
  assert.equal(estimateGgufVramFit({ paramsB: -5 }).ok, false);
  assert.equal(estimateGgufVramFit({ paramsB: 7, quantization: 'BOGUS_Q' }).ok, false);
  assert.equal(estimateGgufVramFit({ paramsB: 7, contextLen: 64 }).ok, false);
  assert.equal(estimateGgufVramFit({ paramsB: 7, gpuVramGiB: 0 }).ok, false);
  assert.equal(estimateGgufVramFit({ paramsB: 7, kvPrecision: 'INT3' }).ok, false);
});

test('9. parseNvidiaSmiCsv parses Quadro P1000 telemetry accurately and handles empty input', () => {
  const gpu = parseNvidiaSmiCsv('Quadro P1000, 4096, 619, 3416, 550.163.01, 2');
  assert.equal(gpu.detected, true);
  assert.equal(gpu.name, 'Quadro P1000');
  assert.equal(gpu.totalMiB, 4096);
  assert.equal(gpu.usedMiB, 619);
  assert.equal(gpu.freeMiB, 3416);
  assert.equal(gpu.driverVersion, '550.163.01');
  assert.equal(gpu.utilizationGpuPct, 2);
  assert.equal(parseNvidiaSmiCsv(''), null);
});

test('10. Multi-provider normalization merges Ollama tags, /api/ps VRAM, and AGY-Hermes models with GPU fit verdicts', () => {
  const snap = normalizeModelsSnapshot({
    mode: 'LIVE_LOOPBACK',
    checkedAt: '2026-11-28T06:50:00.000Z',
    gpu: parseNvidiaSmiCsv('Quadro P1000, 4096, 619, 3416, 550.163.01, 2'),
    ollamaTags: {
      models: [
        {
          name: 'qwen2.5:0.5b',
          size: 397821319,
          details: { format: 'gguf', family: 'qwen2', parameter_size: '494.03M', quantization_level: 'Q4_K_M', context_length: 32768 },
          capabilities: ['completion', 'tools'],
        },
        {
          name: 'hermes3:8b',
          size: 4661227243,
          details: { format: 'gguf', family: 'llama', parameter_size: '8.0B', quantization_level: 'Q4_0', context_length: 131072 },
          capabilities: ['completion'],
        },
      ],
    },
    ollamaPs: {
      models: [
        {
          name: 'qwen2.5:0.5b',
          size: 479954205,
          size_vram: 479954205,
          context_length: 4096,
          details: { family: 'qwen2', parameter_size: '494.03M', quantization_level: 'Q4_K_M' },
        },
      ],
    },
    agyModels: {
      data: [{ id: 'gemini-3.8-flash-medium', display_name: 'Gemini 3.8 Flash', owned_by: 'google-antigravity' }],
    },
    providerProbes: {
      ollama: { online: true, latencyMs: 12, httpStatus: 200 },
      'agy-hermes': { online: true, latencyMs: 4, httpStatus: 200 },
    },
  });

  assert.equal(snap.ok, true);
  assert.equal(snap.mode, 'LIVE_LOOPBACK');
  assert.equal(snap.summary.totalModels, 3);
  assert.equal(snap.summary.localGgufCount, 2);
  assert.equal(snap.summary.routedProxyCount, 1);
  assert.equal(snap.summary.loadedCount, 1);
  assert.equal(snap.summary.onlineProviders, 2);
  const qwen = snap.models.find((m) => m.name === 'qwen2.5:0.5b');
  assert.equal(qwen.loadedInVram, true);
  assert.equal(qwen.hostGpuVerdict, 'FITS_VRAM');
  assert.match(snap.receiptSha256, /^[0-9a-f]{64}$/);
});

test('11. Honest BROWSER_OFFLINE_FALLBACK snapshot has clear notice and deterministic receipt', () => {
  const off1 = buildOfflineModelsSnapshot();
  const off2 = buildOfflineModelsSnapshot();
  assert.equal(off1.mode, 'BROWSER_OFFLINE_FALLBACK');
  assert.ok(off1.offlineNotice && off1.offlineNotice.includes('curated'));
  assert.equal(off1.receiptSha256, off2.receiptSha256);
  assert.ok(off1.models.length >= 10);
});

test('12. Path & secret redaction strips literal /home/<user> and API keys/tokens', () => {
  const sample = 'Loaded /home/operator/.ollama/models with key sk-proj-AbCdEfGhIjKlMnOpQrStUvWx and Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
  const redacted = redactModelsText(sample);
  assert.doesNotMatch(redacted, /\/home\/operator/);
  assert.ok(redacted.includes('~/.ollama/models'));
  assert.doesNotMatch(redacted, /sk-proj-/);
  assert.doesNotMatch(redacted, /eyJhbGciOi/);

  const obj = redactModelsPayload({ p: '/home/alice/models', nested: { tok: 'ghp_1234567890abcdefghij123456' } });
  assert.equal(obj.p, '~/models');
  assert.equal(obj.nested.tok, '[REDACTED_TOKEN]');
});

test('13. Safe copy-only CLI, Modelfile, and loopback curl synthesizer sanitizes shell metacharacters', () => {
  const cmds = synthesizeModelCommands(
    { name: 'qwen2.5:1.5b; rm -rf /', providerId: 'ollama', providerPort: 11434 },
    { contextLen: 8192, gpuLayers: 28, temperature: 0.15, systemPrompt: 'Inspect /home/operator/repo cleanly.' },
  );
  assert.equal(cmds.readOnlyCopyOnly, true);
  assert.doesNotMatch(cmds.ollamaRun, /;/);
  assert.ok(cmds.modelfile.includes('FROM qwen2.5:1.5brm-rf/'));
  assert.ok(cmds.modelfile.includes('PARAMETER num_ctx 8192'));
  assert.ok(cmds.modelfile.includes('~/repo'));
  assert.ok(cmds.curlOpenAi.includes('http://127.0.0.1:11434/v1/chat/completions'));
  assert.match(cmds.receiptSha256, /^[0-9a-f]{64}$/);
});

test('14. Formula-safe CSV & bundle exporters neutralize spreadsheet injection (=, +, -, @) and emit SHA-256 receipts', () => {
  assert.equal(csvEscape('=CMD("calc")'), `"'=CMD(""calc"")"`);
  assert.equal(csvEscape('+SUM(A1:A2)'), `'+SUM(A1:A2)`);
  assert.equal(csvEscape('-1+2'), `'-1+2`);
  assert.equal(csvEscape('@malicious'), `'@malicious`);

  const snap = normalizeModelsSnapshot({
    mode: 'LIVE_LOOPBACK',
    checkedAt: '2026-11-28T06:55:00.000Z',
    ollamaTags: {
      models: [
        { name: '=EVIL_FORMULA:1b', size: 100000000, details: { parameter_size: '1B', quantization_level: 'Q4_K_M' } },
      ],
    },
  });
  const exported = formatModelsConsoleExports(snap);
  assert.match(exported.receiptSha256, /^[0-9a-f]{64}$/);
  assert.ok(exported.csv.includes("'=EVIL_FORMULA:1b"));
  assert.ok(exported.markdown.includes(exported.receiptSha256));
  const parsed = JSON.parse(exported.json);
  assert.equal(parsed.receiptSha256, exported.receiptSha256);
});
