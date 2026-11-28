/**
 * Zoth Local Models Console Engine (v2.4.0)
 * Pure zero-dependency ESM module mirrored byte-identically between:
 *   - src/utils/modelsConsoleEngine.js
 *   - server/models-console-engine.mjs
 *
 * Invariants:
 *   - Zero external dependencies, zero dynamic code execution, zero nondeterministic RNG.
 *   - Strictly read-only catalog normalization & deterministic GGUF/KV-cache VRAM math.
 *   - Strict ~/ path redaction, secret redaction, CSV formula neutralization,
 *     and synchronous FIPS 180-4 SHA-256 verification receipts.
 */

export const MODELS_CONSOLE_SCHEMA_VERSION = '2.4.0';

export const PROVIDER_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: 'ollama',
    name: 'Ollama Local Runtime',
    host: '127.0.0.1',
    port: 11434,
    protocol: 'ollama-http',
    tagsPath: '/api/tags',
    psPath: '/api/ps',
    openaiPath: '/v1/chat/completions',
    role: 'Local GGUF inference daemon & VRAM model residency',
    optional: false,
  }),
  Object.freeze({
    id: 'agy-hermes',
    name: 'AGY-Hermes Proxy',
    host: '127.0.0.1',
    port: 18000,
    protocol: 'openai-compat',
    modelsPath: '/v1/models',
    openaiPath: '/v1/chat/completions',
    role: 'Local OpenAI-compatible multi-model routing gateway',
    optional: false,
  }),
  Object.freeze({
    id: 'lm-studio',
    name: 'LM Studio Local Server',
    host: '127.0.0.1',
    port: 1234,
    protocol: 'openai-compat',
    modelsPath: '/v1/models',
    openaiPath: '/v1/chat/completions',
    role: 'Optional desktop GGUF/MLX local server',
    optional: true,
  }),
  Object.freeze({
    id: 'vllm',
    name: 'vLLM OpenAI Server',
    host: '127.0.0.1',
    port: 8000,
    protocol: 'openai-compat',
    modelsPath: '/v1/models',
    openaiPath: '/v1/chat/completions',
    role: 'Optional paged-attention GPU serving daemon',
    optional: true,
  }),
  Object.freeze({
    id: 'llama-cpp',
    name: 'llama.cpp HTTP Server',
    host: '127.0.0.1',
    port: 8080,
    protocol: 'openai-compat',
    modelsPath: '/v1/models',
    openaiPath: '/v1/chat/completions',
    role: 'Optional standalone GGML/GGUF inference server',
    optional: true,
  }),
]);

export const QUANTIZATION_PROFILES = Object.freeze([
  Object.freeze({
    id: 'Q4_K_M',
    label: 'Q4_K_M (4-bit Balanced)',
    bitsPerWeight: 4.85,
    tier: 'Balanced 4-bit K-quant',
    recommendedUse: 'Default local VRAM efficiency with strong quality retention',
  }),
  Object.freeze({
    id: 'Q5_K_M',
    label: 'Q5_K_M (5-bit High Fidelity)',
    bitsPerWeight: 5.69,
    tier: 'High-fidelity 5-bit K-quant',
    recommendedUse: 'Higher reasoning and code accuracy when ~18% more VRAM is available',
  }),
  Object.freeze({
    id: 'Q6_K',
    label: 'Q6_K (6-bit Near-Lossless)',
    bitsPerWeight: 6.57,
    tier: 'Near-lossless 6-bit K-quant',
    recommendedUse: 'Minimal perplexity drift relative to FP16',
  }),
  Object.freeze({
    id: 'Q8_0',
    label: 'Q8_0 (8-bit Reference)',
    bitsPerWeight: 8.5,
    tier: 'Reference 8-bit integer quant',
    recommendedUse: 'Near-FP16 numerical parity for compact 0.5B–3B models',
  }),
  Object.freeze({
    id: 'FP16',
    label: 'FP16 (16-bit Full Weights)',
    bitsPerWeight: 16.0,
    tier: 'Unquantized half-precision',
    recommendedUse: 'Baseline reference weights and LoRA fine-tuning hosts',
  }),
]);

const EXTRA_QUANT_BPW = Object.freeze({
  Q2_K: 3.15,
  Q3_K_M: 3.9,
  Q4_0: 4.5,
  Q4_K_S: 4.58,
  Q4_K_M: 4.85,
  Q5_0: 5.5,
  Q5_K_S: 5.54,
  Q5_K_M: 5.69,
  Q6_K: 6.57,
  Q8_0: 8.5,
  F16: 16.0,
  FP16: 16.0,
  BF16: 16.0,
  F32: 32.0,
  FP32: 32.0,
});

export const KV_PRECISION_PROFILES = Object.freeze([
  Object.freeze({ id: 'FP16', label: 'FP16 KV Cache (2 B/elem)', bytesPerElem: 2 }),
  Object.freeze({ id: 'Q8_0', label: 'Q8_0 KV Cache (1 B/elem)', bytesPerElem: 1 }),
  Object.freeze({ id: 'Q4_0', label: 'Q4_0 KV Cache (0.5 B/elem)', bytesPerElem: 0.5 }),
]);

export const GPU_PRESETS = Object.freeze([
  Object.freeze({ id: 'quadro-p1000-4g', label: 'Quadro P1000 (4 GiB)', vramGiB: 4, vramMiB: 4096, bandwidthGBs: 82 }),
  Object.freeze({ id: 'gpu-8g', label: 'Workstation 8 GiB', vramGiB: 8, vramMiB: 8192, bandwidthGBs: 256 }),
  Object.freeze({ id: 'gpu-12g', label: 'Workstation 12 GiB', vramGiB: 12, vramMiB: 12288, bandwidthGBs: 360 }),
  Object.freeze({ id: 'gpu-16g', label: 'Workstation 16 GiB', vramGiB: 16, vramMiB: 16384, bandwidthGBs: 448 }),
  Object.freeze({ id: 'gpu-24g', label: 'Pro 24 GiB (RTX 3090/4090)', vramGiB: 24, vramMiB: 24576, bandwidthGBs: 936 }),
  Object.freeze({ id: 'gpu-48g', label: 'Studio 48 GiB (RTX A6000)', vramGiB: 48, vramMiB: 49152, bandwidthGBs: 768 }),
  Object.freeze({ id: 'gpu-80g', label: 'Datacenter 80 GiB (A100/H100)', vramGiB: 80, vramMiB: 81920, bandwidthGBs: 2039 }),
  Object.freeze({ id: 'custom', label: 'Custom VRAM Budget', vramGiB: 4, vramMiB: 4096, bandwidthGBs: null }),
]);

export const MODEL_ARCH_PRESETS = Object.freeze([
  Object.freeze({ id: 'qwen2.5:0.5b', label: 'Qwen 2.5 0.5B (GQA)', paramsB: 0.494, layers: 24, kvHeads: 2, headDim: 64, defaultContext: 4096, defaultQuant: 'Q4_K_M' }),
  Object.freeze({ id: 'llama3.2:1b', label: 'Llama 3.2 1B (GQA)', paramsB: 1.24, layers: 16, kvHeads: 8, headDim: 64, defaultContext: 8192, defaultQuant: 'Q8_0' }),
  Object.freeze({ id: 'qwen2.5:1.5b', label: 'Qwen 2.5 1.5B (GQA)', paramsB: 1.54, layers: 28, kvHeads: 2, headDim: 128, defaultContext: 8192, defaultQuant: 'Q4_K_M' }),
  Object.freeze({ id: 'qwen3:1.7b', label: 'Qwen 3 1.7B (GQA)', paramsB: 1.72, layers: 28, kvHeads: 8, headDim: 128, defaultContext: 8192, defaultQuant: 'Q4_K_M' }),
  Object.freeze({ id: 'zoth-gr:2.5b', label: 'Zoth-GR 2.5B (GQA)', paramsB: 2.5, layers: 28, kvHeads: 4, headDim: 128, defaultContext: 8192, defaultQuant: 'Q4_K_M' }),
  Object.freeze({ id: 'hermes3:8b', label: 'Hermes 3 8B (Llama-3 GQA)', paramsB: 8.03, layers: 32, kvHeads: 8, headDim: 128, defaultContext: 8192, defaultQuant: 'Q4_K_M' }),
  Object.freeze({ id: 'qwen2.5-coder:14b', label: 'Qwen 2.5 Coder 14B (GQA)', paramsB: 14.7, layers: 48, kvHeads: 8, headDim: 128, defaultContext: 8192, defaultQuant: 'Q4_K_M' }),
  Object.freeze({ id: 'llama3.3:70b', label: 'Llama 3.3 70B (GQA)', paramsB: 70.6, layers: 80, kvHeads: 8, headDim: 128, defaultContext: 8192, defaultQuant: 'Q4_K_M' }),
]);

// --- Pure Synchronous FIPS 180-4 SHA-256 ---

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function utf8ToBytes(str) {
  const s = String(str ?? '');
  const bytes = [];
  for (let i = 0; i < s.length; i++) {
    let code = s.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < s.length) {
      const next = s.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = ((code - 0xd800) << 10) + (next - 0xdc00) + 0x10000;
        i++;
      }
    }
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return new Uint8Array(bytes);
}

export function sha256Hex(input) {
  const msg = utf8ToBytes(input);
  const bitLenHi = Math.floor((msg.length * 8) / 0x100000000);
  const bitLenLo = (msg.length * 8) >>> 0;
  const paddedLen = Math.ceil((msg.length + 9) / 64) * 64;
  const buf = new Uint8Array(paddedLen);
  buf.set(msg);
  buf[msg.length] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(paddedLen - 8, bitLenHi, false);
  view.setUint32(paddedLen - 4, bitLenLo, false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);
  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^ ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3);
      const s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^ ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7].map((n) => n.toString(16).padStart(8, '0')).join('');
}

// --- Path & Secret Redaction ---

const HOME_PATH_RE = /\/(?:home|Users)\/[a-zA-Z0-9._-]+/g;
const SECRET_PATTERNS = [
  /\bsk-(?:proj-|ant-api\d+-|live-|test-)?[A-Za-z0-9_-]{16,}\b/g,
  /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/g,
  /\bAIza[0-9A-Za-z_-]{20,}\b/g,
  /\bxox[baprs]-[0-9A-Za-z-]{16,}\b/g,
  /\b(Bearer\s+)[A-Za-z0-9._~+/=-]{20,}\b/gi,
  /((?:api[_-]?key|secret|token|password)\s*[:=]\s*["']?)[A-Za-z0-9._~+/=-]{12,}/gi,
];

export function redactModelsText(input) {
  if (typeof input !== 'string') return input;
  let out = input.replace(HOME_PATH_RE, '~');
  out = out.replace(SECRET_PATTERNS[0], '[REDACTED_KEY]');
  out = out.replace(SECRET_PATTERNS[1], '[REDACTED_TOKEN]');
  out = out.replace(SECRET_PATTERNS[2], '[REDACTED_API_KEY]');
  out = out.replace(SECRET_PATTERNS[3], '[REDACTED_SLACK_TOKEN]');
  out = out.replace(SECRET_PATTERNS[4], '$1[REDACTED_BEARER]');
  out = out.replace(SECRET_PATTERNS[5], '$1[REDACTED]');
  return out;
}

export function redactModelsPayload(value, depth = 0) {
  if (depth > 16 || value === null || value === undefined) return value;
  if (typeof value === 'string') return redactModelsText(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map((item) => redactModelsPayload(item, depth + 1));
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
      out[k] = redactModelsPayload(v, depth + 1);
    }
    return out;
  }
  return String(value);
}

// --- Numeric & Formatting Helpers ---

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function round3(n) {
  return Math.round((Number(n) || 0) * 1000) / 1000;
}

export function parseParameterSizeToBillions(raw) {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) && raw > 0 ? round3(raw) : null;
  }
  const s = String(raw || '').trim().toUpperCase();
  if (!s || s.startsWith('-')) return null;
  const m = s.match(/(\d+(?:\.\d+)?)\s*([BMK])?/);
  if (!m) return null;
  const val = Number(m[1]);
  if (!Number.isFinite(val) || val <= 0) return null;
  const unit = m[2] || 'B';
  if (unit === 'M') return round3(val / 1000);
  if (unit === 'K') return round3(val / 1e6);
  return round3(val);
}

export function inferModelArchitecture(paramsB, hints = {}) {
  const p = Number(paramsB);
  const layersHint = Number(hints.layers);
  const kvHeadsHint = Number(hints.kvHeads);
  const headDimHint = Number(hints.headDim);

  let layers = 32;
  let kvHeads = 8;
  let headDim = 128;

  if (Number.isFinite(p)) {
    if (p <= 0.7) {
      layers = 24;
      kvHeads = 2;
      headDim = 64;
    } else if (p <= 1.35) {
      layers = 16;
      kvHeads = 8;
      headDim = 64;
    } else if (p <= 2.1) {
      layers = 28;
      kvHeads = 2;
      headDim = 128;
    } else if (p <= 4.5) {
      layers = 28;
      kvHeads = 4;
      headDim = 128;
    } else if (p <= 10) {
      layers = 32;
      kvHeads = 8;
      headDim = 128;
    } else if (p <= 20) {
      layers = 48;
      kvHeads = 8;
      headDim = 128;
    } else if (p <= 40) {
      layers = 64;
      kvHeads = 8;
      headDim = 128;
    } else {
      layers = 80;
      kvHeads = 8;
      headDim = 128;
    }
  }

  return {
    layers: Number.isFinite(layersHint) && layersHint >= 1 && layersHint <= 256 ? Math.round(layersHint) : layers,
    kvHeads: Number.isFinite(kvHeadsHint) && kvHeadsHint >= 1 && kvHeadsHint <= 128 ? Math.round(kvHeadsHint) : kvHeads,
    headDim: Number.isFinite(headDimHint) && headDimHint >= 32 && headDimHint <= 512 ? Math.round(headDimHint) : headDim,
  };
}

export function resolveQuantBitsPerWeight(quantId) {
  const key = String(quantId || 'Q4_K_M').trim().toUpperCase();
  if (Object.prototype.hasOwnProperty.call(EXTRA_QUANT_BPW, key)) {
    return { quantId: key, bitsPerWeight: EXTRA_QUANT_BPW[key] };
  }
  return null;
}

// --- Deterministic GGUF Weight + KV-Cache VRAM Fit Calculator ---

export function estimateGgufVramFit(input = {}) {
  const paramsB = Number(input.paramsB);
  if (!Number.isFinite(paramsB) || paramsB <= 0 || paramsB > 1000) {
    return { ok: false, error: 'paramsB must be a finite number between 0.01 and 1000 (billions of parameters).' };
  }

  const quantResolved = resolveQuantBitsPerWeight(input.quantization || 'Q4_K_M');
  if (!quantResolved) {
    return { ok: false, error: `Unsupported quantization "${String(input.quantization || '')}". Supported: Q4_K_M, Q5_K_M, Q6_K, Q8_0, FP16, Q4_0.` };
  }

  const contextLen = Math.round(Number(input.contextLen ?? 4096));
  if (!Number.isFinite(contextLen) || contextLen < 256 || contextLen > 1048576) {
    return { ok: false, error: 'contextLen must be a finite integer between 256 and 1048576 tokens.' };
  }

  const gpuVramGiB = Number(input.gpuVramGiB ?? 4);
  if (!Number.isFinite(gpuVramGiB) || gpuVramGiB <= 0 || gpuVramGiB > 2048) {
    return { ok: false, error: 'gpuVramGiB must be a finite number between 0.5 and 2048 GiB.' };
  }

  const kvPrecisionRaw = String(input.kvPrecision || 'FP16').trim().toUpperCase();
  const kvProfile = KV_PRECISION_PROFILES.find((p) => p.id === kvPrecisionRaw);
  if (!kvProfile) {
    return { ok: false, error: `Unsupported kvPrecision "${kvPrecisionRaw}". Supported: FP16, Q8_0, Q4_0.` };
  }

  const arch = inferModelArchitecture(paramsB, {
    layers: input.layers,
    kvHeads: input.kvHeads,
    headDim: input.headDim,
  });

  const weightBytes = (paramsB * 1e9 * quantResolved.bitsPerWeight) / 8;
  const weightMiB = round2(weightBytes / (1024 * 1024));
  const weightGiB = round3(weightBytes / (1024 * 1024 * 1024));

  // KV-cache formula: 2 (K + V) * layers * kvHeads * headDim * contextLen * kvBytesPerElem
  const kvCacheBytes = 2 * arch.layers * arch.kvHeads * arch.headDim * contextLen * kvProfile.bytesPerElem;
  const kvCacheMiB = round2(kvCacheBytes / (1024 * 1024));
  const kvCacheGiB = round3(kvCacheBytes / (1024 * 1024 * 1024));

  // Deterministic CUDA/GGML compute graph & activation overhead (384–512 MiB)
  const defaultOverheadMiB = Math.min(512, Math.max(384, Math.round(384 + paramsB * 10)));
  const overheadMiB = Number.isFinite(Number(input.overheadMiB)) && Number(input.overheadMiB) >= 0 && Number(input.overheadMiB) <= 16384
    ? round2(Number(input.overheadMiB))
    : defaultOverheadMiB;
  const overheadGiB = round3(overheadMiB / 1024);

  const totalMiB = round2(weightMiB + kvCacheMiB + overheadMiB);
  const totalGiB = round3(totalMiB / 1024);
  const budgetMiB = round2(gpuVramGiB * 1024);
  const headroomMiB = round2(budgetMiB - totalMiB);
  const utilizationPct = round2((totalMiB / budgetMiB) * 100);

  let verdict = 'EXCEEDS_BUDGET';
  let verdictSummary = 'Total VRAM exceeds GPU capacity; select a smaller model, tighter quantization, or larger GPU.';
  let recommendedGpuLayers = 0;

  if (totalMiB <= budgetMiB) {
    verdict = 'FITS_VRAM';
    recommendedGpuLayers = arch.layers;
    verdictSummary = utilizationPct > 90
      ? `Fits fully in ${gpuVramGiB} GiB VRAM with tight headroom (${headroomMiB} MiB free); avoid concurrent GPU workloads.`
      : `Fits comfortably in ${gpuVramGiB} GiB VRAM (${headroomMiB} MiB headroom remaining).`;
  } else if (totalMiB <= budgetMiB * 1.75) {
    verdict = 'PARTIAL_CPU_OFFLOAD';
    const availableForWeightsMiB = Math.max(0, budgetMiB - kvCacheMiB - overheadMiB);
    recommendedGpuLayers = Math.max(
      0,
      Math.min(arch.layers, Math.floor((arch.layers * availableForWeightsMiB) / Math.max(1, weightMiB))),
    );
    verdictSummary = `Exceeds ${gpuVramGiB} GiB VRAM by ${round2(Math.abs(headroomMiB))} MiB; offload ~${recommendedGpuLayers}/${arch.layers} layers to GPU and spill remainder to system RAM.`;
  } else {
    const availableForWeightsMiB = Math.max(0, budgetMiB - kvCacheMiB - overheadMiB);
    recommendedGpuLayers = Math.max(
      0,
      Math.min(arch.layers, Math.floor((arch.layers * availableForWeightsMiB) / Math.max(1, weightMiB))),
    );
  }

  // Max context length that fits within budget for this weight + overhead
  const bytesPerTokenKv = 2 * arch.layers * arch.kvHeads * arch.headDim * kvProfile.bytesPerElem;
  const remainingForKvBytes = Math.max(0, (budgetMiB - weightMiB - overheadMiB) * 1024 * 1024);
  const maxContextAtBudget = bytesPerTokenKv > 0 ? Math.floor(remainingForKvBytes / bytesPerTokenKv) : 0;

  const quantMatrix = QUANTIZATION_PROFILES.map((qp) => {
    const qWeightBytes = (paramsB * 1e9 * qp.bitsPerWeight) / 8;
    const qWeightMiB = round2(qWeightBytes / (1024 * 1024));
    const qTotalMiB = round2(qWeightMiB + kvCacheMiB + overheadMiB);
    const qUtilPct = round2((qTotalMiB / budgetMiB) * 100);
    const qVerdict = qTotalMiB <= budgetMiB
      ? 'FITS_VRAM'
      : qTotalMiB <= budgetMiB * 1.75
        ? 'PARTIAL_CPU_OFFLOAD'
        : 'EXCEEDS_BUDGET';
    return {
      quantization: qp.id,
      bitsPerWeight: qp.bitsPerWeight,
      tier: qp.tier,
      weightMiB: qWeightMiB,
      weightGiB: round3(qWeightMiB / 1024),
      kvCacheMiB,
      overheadMiB,
      totalMiB: qTotalMiB,
      totalGiB: round3(qTotalMiB / 1024),
      headroomMiB: round2(budgetMiB - qTotalMiB),
      utilizationPct: qUtilPct,
      verdict: qVerdict,
    };
  });

  const payload = {
    ok: true,
    schemaVersion: MODELS_CONSOLE_SCHEMA_VERSION,
    inputs: {
      paramsB: round3(paramsB),
      quantization: quantResolved.quantId,
      bitsPerWeight: quantResolved.bitsPerWeight,
      contextLen,
      kvPrecision: kvProfile.id,
      kvBytesPerElem: kvProfile.bytesPerElem,
      layers: arch.layers,
      kvHeads: arch.kvHeads,
      headDim: arch.headDim,
      gpuVramGiB: round2(gpuVramGiB),
      budgetMiB,
    },
    breakdown: {
      weightMiB,
      weightGiB,
      kvCacheMiB,
      kvCacheGiB,
      overheadMiB,
      overheadGiB,
      totalMiB,
      totalGiB,
      headroomMiB,
      utilizationPct,
    },
    verdict,
    verdictSummary,
    recommendedGpuLayers,
    maxContextAtBudget,
    quantMatrix,
  };

  return {
    ...payload,
    receiptSha256: sha256Hex(JSON.stringify(payload)),
  };
}

// --- Multi-Provider Normalization & Host GPU Telemetry ---

export function parseNvidiaSmiCsv(csvLine) {
  const cleaned = String(csvLine || '').trim();
  if (!cleaned) return null;
  const firstLine = cleaned.split(/\r?\n/)[0] || '';
  const parts = firstLine.split(',').map((s) => s.trim());
  if (parts.length < 4) return null;
  const totalMiB = Number(parts[1]);
  const usedMiB = Number(parts[2]);
  const freeMiB = Number(parts[3]);
  if (!Number.isFinite(totalMiB) || totalMiB <= 0) return null;
  const safeUsed = Number.isFinite(usedMiB) && usedMiB >= 0 ? usedMiB : 0;
  const safeFree = Number.isFinite(freeMiB) && freeMiB >= 0 ? freeMiB : Math.max(0, totalMiB - safeUsed);
  const utilPct = parts[5] !== undefined && Number.isFinite(Number(parts[5])) ? Number(parts[5]) : null;
  return {
    detected: true,
    name: redactModelsText(parts[0] || 'NVIDIA GPU'),
    totalMiB: Math.round(totalMiB),
    usedMiB: Math.round(safeUsed),
    freeMiB: Math.round(safeFree),
    totalGiB: round2(totalMiB / 1024),
    usedPct: round2((safeUsed / totalMiB) * 100),
    driverVersion: parts[4] ? redactModelsText(parts[4]) : null,
    utilizationGpuPct: utilPct,
    source: 'nvidia-smi-readonly',
  };
}

function sanitizeCapabilities(caps) {
  if (!Array.isArray(caps)) return [];
  return caps.map((c) => String(c || '').trim().toLowerCase()).filter(Boolean);
}

export function normalizeModelsSnapshot(raw = {}) {
  const mode = raw.mode === 'LIVE_LOOPBACK' ? 'LIVE_LOOPBACK' : 'BROWSER_OFFLINE_FALLBACK';
  const checkedAt = typeof raw.checkedAt === 'string' && raw.checkedAt ? raw.checkedAt : new Date().toISOString();

  const gpu = raw.gpu && typeof raw.gpu === 'object' && Number.isFinite(Number(raw.gpu.totalMiB))
    ? {
        detected: Boolean(raw.gpu.detected),
        name: redactModelsText(String(raw.gpu.name || 'Host GPU')),
        totalMiB: Math.round(Number(raw.gpu.totalMiB)),
        usedMiB: Math.round(Number(raw.gpu.usedMiB || 0)),
        freeMiB: Math.round(Number(raw.gpu.freeMiB ?? Math.max(0, Number(raw.gpu.totalMiB) - Number(raw.gpu.usedMiB || 0)))),
        totalGiB: round2(Number(raw.gpu.totalMiB) / 1024),
        usedPct: round2((Number(raw.gpu.usedMiB || 0) / Math.max(1, Number(raw.gpu.totalMiB))) * 100),
        driverVersion: raw.gpu.driverVersion ? redactModelsText(String(raw.gpu.driverVersion)) : null,
        utilizationGpuPct: Number.isFinite(Number(raw.gpu.utilizationGpuPct)) ? Number(raw.gpu.utilizationGpuPct) : null,
        source: String(raw.gpu.source || (mode === 'LIVE_LOOPBACK' ? 'nvidia-smi-readonly' : 'offline-reference-gpu')),
      }
    : {
        detected: false,
        name: 'Quadro P1000 (Reference 4 GiB Profile)',
        totalMiB: 4096,
        usedMiB: 0,
        freeMiB: 4096,
        totalGiB: 4,
        usedPct: 0,
        driverVersion: null,
        utilizationGpuPct: null,
        source: mode === 'LIVE_LOOPBACK' ? 'gpu-probe-unavailable' : 'offline-reference-gpu',
      };

  const hostVramGiB = Math.max(1, gpu.totalMiB / 1024);

  // Active VRAM models from Ollama /api/ps
  const rawPsModels = Array.isArray(raw.ollamaPs?.models) ? raw.ollamaPs.models : [];
  const psByName = new Map();
  const loadedModels = rawPsModels.map((entry) => {
    const name = redactModelsText(String(entry?.name || entry?.model || 'unknown'));
    const sizeBytes = Number(entry?.size || 0);
    const vramBytes = Number(entry?.size_vram ?? entry?.size ?? 0);
    const details = entry?.details || {};
    const paramLabel = String(details.parameter_size || '').trim() || null;
    const paramsB = parseParameterSizeToBillions(paramLabel);
    const quantization = String(details.quantization_level || 'Q4_K_M').trim().toUpperCase();
    const rec = {
      name,
      providerId: 'ollama',
      family: String(details.family || 'gguf'),
      paramLabel: paramLabel || (paramsB ? `${paramsB}B` : 'n/a'),
      paramsB,
      quantization,
      sizeBytes,
      sizeMiB: round2(sizeBytes / (1024 * 1024)),
      vramBytes,
      vramMiB: round2(vramBytes / (1024 * 1024)),
      contextLength: Number(entry?.context_length || 4096),
      expiresAt: typeof entry?.expires_at === 'string' ? entry.expires_at : null,
      digestShort: typeof entry?.digest === 'string' ? entry.digest.slice(0, 12) : null,
    };
    psByName.set(name, rec);
    return rec;
  });

  const models = [];

  // 1. Ollama /api/tags
  const rawOllamaTags = Array.isArray(raw.ollamaTags?.models) ? raw.ollamaTags.models : [];
  for (const entry of rawOllamaTags) {
    const name = redactModelsText(String(entry?.name || entry?.model || '').trim());
    if (!name) continue;
    const details = entry?.details || {};
    const sizeBytes = Number(entry?.size || 0);
    const sizeGiB = round2(sizeBytes / (1024 * 1024 * 1024));
    const paramLabel = String(details.parameter_size || '').trim() || null;
    const paramsB = parseParameterSizeToBillions(paramLabel);
    const quantization = String(details.quantization_level || 'Q4_K_M').trim().toUpperCase();
    const contextLength = Number(details.context_length || 4096);
    const psMatch = psByName.get(name) || null;
    const fitEval = paramsB
      ? estimateGgufVramFit({
          paramsB,
          quantization: resolveQuantBitsPerWeight(quantization) ? quantization : 'Q4_K_M',
          contextLen: Math.min(contextLength, 8192),
          gpuVramGiB: hostVramGiB,
        })
      : null;

    models.push({
      id: `ollama:${name}`,
      name,
      displayName: name,
      providerId: 'ollama',
      providerName: 'Ollama Local Runtime',
      providerPort: 11434,
      format: String(details.format || 'gguf').toUpperCase(),
      family: String(details.family || 'llama'),
      parentModel: details.parent_model ? redactModelsText(String(details.parent_model)) : null,
      paramLabel: paramLabel || (paramsB ? `${paramsB}B` : 'unknown'),
      paramsB,
      quantization,
      sizeBytes,
      sizeGiB,
      contextLength,
      capabilities: sanitizeCapabilities(entry?.capabilities || ['completion']),
      loadedInVram: Boolean(psMatch),
      vramMiB: psMatch ? psMatch.vramMiB : 0,
      ownedBy: 'local-ollama',
      modifiedAt: typeof entry?.modified_at === 'string' ? entry.modified_at : null,
      hostGpuVerdict: fitEval?.ok ? fitEval.verdict : 'UNKNOWN',
      estimatedVramMiB: fitEval?.ok ? fitEval.breakdown.totalMiB : null,
    });
  }

  // 2. OpenAI-compatible local providers (AGY-Hermes :18000, LM Studio :1234, vLLM :8000, llama.cpp :8080)
  const openaiBuckets = [
    { id: 'agy-hermes', name: 'AGY-Hermes Proxy', port: 18000, raw: raw.agyModels },
    { id: 'lm-studio', name: 'LM Studio Local Server', port: 1234, raw: raw.lmStudioModels },
    { id: 'vllm', name: 'vLLM OpenAI Server', port: 8000, raw: raw.vllmModels },
    { id: 'llama-cpp', name: 'llama.cpp HTTP Server', port: 8080, raw: raw.llamaCppModels },
  ];

  for (const bucket of openaiBuckets) {
    const list = Array.isArray(bucket.raw?.data)
      ? bucket.raw.data
      : Array.isArray(bucket.raw?.models)
        ? bucket.raw.models
        : [];
    for (const item of list) {
      const modelId = redactModelsText(String(item?.id || item?.name || '').trim());
      if (!modelId) continue;
      const displayName = redactModelsText(String(item?.display_name || item?.name || modelId));
      const ownedBy = redactModelsText(String(item?.owned_by || bucket.id));
      const family = ownedBy.includes('anthropic')
        ? 'claude'
        : ownedBy.includes('google')
          ? 'gemini'
          : modelId.toLowerCase().includes('gpt')
            ? 'gpt-oss'
            : bucket.id;
      models.push({
        id: `${bucket.id}:${modelId}`,
        name: modelId,
        displayName,
        providerId: bucket.id,
        providerName: bucket.name,
        providerPort: bucket.port,
        format: bucket.id === 'agy-hermes' ? 'API-ROUTE' : 'LOCAL-SERVED',
        family,
        parentModel: null,
        paramLabel: bucket.id === 'agy-hermes' ? 'routed' : 'local',
        paramsB: null,
        quantization: bucket.id === 'agy-hermes' ? 'ROUTED' : 'RUNTIME',
        sizeBytes: 0,
        sizeGiB: 0,
        contextLength: Number(item?.context_length || (bucket.id === 'agy-hermes' ? 128000 : 8192)),
        capabilities: ['chat', 'openai-compat'],
        loadedInVram: false,
        vramMiB: 0,
        ownedBy,
        modifiedAt: null,
        hostGpuVerdict: bucket.id === 'agy-hermes' ? 'REMOTE_OR_PROXY' : 'RUNTIME_MANAGED',
        estimatedVramMiB: null,
      });
    }
  }

  const probeMap = raw.providerProbes && typeof raw.providerProbes === 'object' ? raw.providerProbes : {};
  const providers = PROVIDER_DEFINITIONS.map((def) => {
    const p = probeMap[def.id] || {};
    const providerModels = models.filter((m) => m.providerId === def.id);
    const online = typeof p.online === 'boolean' ? p.online : providerModels.length > 0;
    return {
      ...def,
      online,
      status: online ? 'ONLINE' : (def.optional ? 'STANDBY' : 'OFFLINE'),
      latencyMs: Number.isFinite(Number(p.latencyMs)) ? Math.max(0, Math.round(Number(p.latencyMs))) : null,
      httpStatus: Number.isFinite(Number(p.httpStatus)) ? Number(p.httpStatus) : (online ? 200 : 0),
      modelCount: providerModels.length,
      loadedCount: def.id === 'ollama' ? loadedModels.length : 0,
      version: p.version ? redactModelsText(String(p.version)) : null,
      readOnly: true,
    };
  });

  const localGgufModels = models.filter((m) => m.providerId === 'ollama');
  const routedProxyModels = models.filter((m) => m.providerId === 'agy-hermes');
  const fitsHostGpuCount = localGgufModels.filter((m) => m.hostGpuVerdict === 'FITS_VRAM').length;
  const loadedVramMiB = round2(loadedModels.reduce((acc, m) => acc + (Number(m.vramMiB) || 0), 0));
  const totalDiskGiB = round2(localGgufModels.reduce((acc, m) => acc + (Number(m.sizeGiB) || 0), 0));

  const snapshotCore = redactModelsPayload({
    ok: true,
    schemaVersion: MODELS_CONSOLE_SCHEMA_VERSION,
    mode,
    readOnly: true,
    checkedAt,
    offlineNotice: mode === 'BROWSER_OFFLINE_FALLBACK'
      ? 'Loopback Studio API (:3000) unreachable from this static page — showing curated local reference catalog. GGUF/KV-cache VRAM calculator, CLI/Modelfile/curl synthesizer, and exports run 100% client-side.'
      : null,
    summary: {
      totalModels: models.length,
      localGgufCount: localGgufModels.length,
      routedProxyCount: routedProxyModels.length,
      onlineProviders: providers.filter((p) => p.online).length,
      totalProviders: providers.length,
      loadedCount: loadedModels.length,
      loadedVramMiB,
      totalDiskGiB,
      fitsHostGpuCount,
    },
    gpu,
    providers,
    loadedModels,
    models,
  });

  return {
    ...snapshotCore,
    receiptSha256: sha256Hex(JSON.stringify(snapshotCore)),
  };
}

// --- Honest Curated Offline Fallback Snapshot ---

export function buildOfflineModelsSnapshot() {
  return normalizeModelsSnapshot({
    mode: 'BROWSER_OFFLINE_FALLBACK',
    checkedAt: '2026-11-28T00:00:00.000Z',
    gpu: {
      detected: false,
      name: 'NVIDIA Quadro P1000 (Offline Reference 4 GiB)',
      totalMiB: 4096,
      usedMiB: 619,
      freeMiB: 3416,
      driverVersion: '550.x',
      utilizationGpuPct: 0,
      source: 'offline-curated-snapshot',
    },
    providerProbes: {
      ollama: { online: false, latencyMs: null, httpStatus: 0 },
      'agy-hermes': { online: false, latencyMs: null, httpStatus: 0 },
      'lm-studio': { online: false, latencyMs: null, httpStatus: 0 },
      vllm: { online: false, latencyMs: null, httpStatus: 0 },
      'llama-cpp': { online: false, latencyMs: null, httpStatus: 0 },
    },
    ollamaPs: {
      models: [
        {
          name: 'qwen2.5:0.5b',
          size: 479954205,
          size_vram: 479954205,
          context_length: 4096,
          details: { format: 'gguf', family: 'qwen2', parameter_size: '494.03M', quantization_level: 'Q4_K_M' },
        },
      ],
    },
    ollamaTags: {
      models: [
        {
          name: 'qwen2.5:0.5b',
          size: 397821319,
          details: { format: 'gguf', family: 'qwen2', parameter_size: '494.03M', quantization_level: 'Q4_K_M', context_length: 32768 },
          capabilities: ['completion', 'tools'],
        },
        {
          name: 'qwen2.5:1.5b',
          size: 986061979,
          details: { format: 'gguf', family: 'qwen2', parameter_size: '1.5B', quantization_level: 'Q4_K_M', context_length: 32768 },
          capabilities: ['completion', 'tools'],
        },
        {
          name: 'qwen2.5-coder:1.5b',
          size: 986061979,
          details: { format: 'gguf', family: 'qwen2', parameter_size: '1.5B', quantization_level: 'Q4_K_M', context_length: 32768 },
          capabilities: ['completion', 'tools'],
        },
        {
          name: 'llama3.2:1b',
          size: 1321098329,
          details: { format: 'gguf', family: 'llama', parameter_size: '1.2B', quantization_level: 'Q8_0', context_length: 131072 },
          capabilities: ['completion', 'tools'],
        },
        {
          name: 'qwen3:1.7b',
          size: 1359293444,
          details: { format: 'gguf', family: 'qwen3', parameter_size: '2.0B', quantization_level: 'Q4_K_M', context_length: 40960 },
          capabilities: ['completion', 'tools', 'thinking'],
        },
        {
          name: 'zoth-gr:latest',
          size: 1545323301,
          details: { format: 'gguf', family: 'qwen2', parameter_size: '2.5B', quantization_level: 'Q4_K_M', context_length: 32768 },
          capabilities: ['completion', 'tools'],
        },
        {
          name: 'hermes3:8b',
          size: 4661227243,
          details: { format: 'gguf', family: 'llama', parameter_size: '8.0B', quantization_level: 'Q4_0', context_length: 131072 },
          capabilities: ['completion', 'tools'],
        },
      ],
    },
    agyModels: {
      data: [
        { id: 'gemini-3.8-flash-medium', display_name: 'Gemini 3.8 Flash (Medium)', owned_by: 'google-antigravity' },
        { id: 'gemini-4-neon-high', display_name: 'Gemini 4 Neon (High)', owned_by: 'google-antigravity' },
        { id: 'claude-sonnet-5-5-medium', display_name: 'Claude Sonnet 5.5 (Medium)', owned_by: 'anthropic-antigravity' },
        { id: 'gpt-oss-120b-medium', display_name: 'GPT-OSS 120B (Medium)', owned_by: 'openai-antigravity' },
      ],
    },
  });
}

// --- Safe Copy-Only CLI / Modelfile / OpenAI-compat curl Synthesizer ---

export function sanitizeModelIdentifier(name) {
  const cleaned = String(name || 'qwen2.5:0.5b')
    .trim()
    .replace(/[^a-zA-Z0-9._:/@-]/g, '');
  return cleaned || 'qwen2.5:0.5b';
}

export function synthesizeModelCommands(model = {}, options = {}) {
  const safeName = sanitizeModelIdentifier(model?.name || model?.id || 'qwen2.5:0.5b');
  const providerId = String(model?.providerId || 'ollama');
  const port = Number(model?.providerPort || (providerId === 'agy-hermes' ? 18000 : providerId === 'lm-studio' ? 1234 : providerId === 'vllm' ? 8000 : providerId === 'llama-cpp' ? 8080 : 11434));
  const contextLen = Math.min(131072, Math.max(512, Math.round(Number(options.contextLen || model?.contextLength || 4096))));
  const temperature = Math.min(2, Math.max(0, round2(Number(options.temperature ?? 0.2))));
  const gpuLayers = Number.isFinite(Number(options.gpuLayers)) ? Math.max(0, Math.round(Number(options.gpuLayers))) : 99;
  const systemPrompt = redactModelsText(
    String(options.systemPrompt || 'You are a concise, deterministic local engineering assistant. Report concrete facts and verified paths only.')
      .replace(/"/g, "'")
      .replace(/\r?\n/g, ' ')
      .slice(0, 400),
  );

  const ollamaBaseModel = providerId === 'ollama' ? safeName : 'qwen2.5:1.5b';

  const ollamaRun = `ollama run ${ollamaBaseModel}`;
  const ollamaShow = `ollama show ${ollamaBaseModel}`;
  const ollamaPs = 'ollama ps';
  const curlOllamaTags = 'curl -sS http://127.0.0.1:11434/api/tags | jq ".models | length"';

  const modelfile = [
    `# Deterministic Zoth Local Models Console Modelfile (copy-only)`,
    `FROM ${ollamaBaseModel}`,
    `PARAMETER num_ctx ${contextLen}`,
    `PARAMETER num_gpu ${gpuLayers}`,
    `PARAMETER temperature ${temperature}`,
    `SYSTEM "${systemPrompt}"`,
  ].join('\n');

  const endpoint = `http://127.0.0.1:${port}/v1/chat/completions`;
  const curlPayload = JSON.stringify({
    model: safeName,
    temperature,
    max_tokens: 256,
    messages: [
      { role: 'system', content: 'Respond concisely with verified facts.' },
      { role: 'user', content: 'Confirm model readiness in one line.' },
    ],
  });

  const curlOpenAi = [
    `curl -sS ${endpoint} \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '${curlPayload.replace(/'/g, "'\\''")}'`,
  ].join('\n');

  const core = {
    model: safeName,
    providerId,
    port,
    readOnlyCopyOnly: true,
    safetyNotice: 'Copy-only operator snippets. Zoth Local Models Console never auto-executes ollama pull/run or mutates standing daemons.',
    ollamaRun,
    ollamaShow,
    ollamaPs,
    curlOllamaTags,
    modelfile,
    curlOpenAi,
  };

  return {
    ...core,
    receiptSha256: sha256Hex(JSON.stringify(core)),
  };
}

// --- Formula-Safe CSV, JSON & Markdown Exporters ---

export function csvEscape(value) {
  let s = redactModelsText(String(value ?? ''));
  if (/^[\s]*[=+\-@\t\r]/.test(s)) {
    s = `'${s}`;
  }
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function formatModelsConsoleExports(snapshot, estimate = null, commands = null) {
  const safeSnap = redactModelsPayload(snapshot || buildOfflineModelsSnapshot());
  const safeEst = estimate ? redactModelsPayload(estimate) : estimateGgufVramFit({ paramsB: 1.54, quantization: 'Q4_K_M', contextLen: 8192, gpuVramGiB: safeSnap.gpu?.totalGiB || 4 });
  const safeCmds = commands ? redactModelsPayload(commands) : synthesizeModelCommands(safeSnap.models?.[0] || {});

  const bundle = {
    schemaVersion: MODELS_CONSOLE_SCHEMA_VERSION,
    exportedAt: safeSnap.checkedAt,
    mode: safeSnap.mode,
    readOnly: true,
    summary: safeSnap.summary,
    gpu: safeSnap.gpu,
    providers: safeSnap.providers,
    loadedModels: safeSnap.loadedModels,
    models: safeSnap.models,
    vramEstimate: safeEst,
    commands: safeCmds,
  };
  const receiptSha256 = sha256Hex(JSON.stringify(bundle));
  const json = JSON.stringify({ ...bundle, receiptSha256 }, null, 2);

  const mdLines = [
    `# Zoth Local Models Console Report (v${MODELS_CONSOLE_SCHEMA_VERSION})`,
    '',
    `- **Mode:** \`${safeSnap.mode}\` (strictly read-only probes)`,
    `- **Checked At:** \`${safeSnap.checkedAt}\``,
    `- **Host GPU:** ${safeSnap.gpu?.name || 'Unknown'} (${safeSnap.gpu?.usedMiB ?? 0} / ${safeSnap.gpu?.totalMiB ?? 0} MiB used, ${safeSnap.gpu?.freeMiB ?? 0} MiB free)`,
    `- **Inventory:** ${safeSnap.summary?.totalModels ?? 0} models (${safeSnap.summary?.localGgufCount ?? 0} local GGUF, ${safeSnap.summary?.routedProxyCount ?? 0} AGY-Hermes routed, ${safeSnap.summary?.loadedCount ?? 0} loaded in VRAM)`,
    `- **Receipt SHA-256:** \`${receiptSha256}\``,
    '',
    '## Active VRAM Residency (`/api/ps`)',
    '',
    ...(safeSnap.loadedModels?.length
      ? [
          '| Model | Params | Quant | VRAM (MiB) | Context |',
          '| :--- | :---: | :---: | :---: | :---: |',
          ...safeSnap.loadedModels.map((m) => `| \`${m.name}\` | ${m.paramLabel} | ${m.quantization} | ${m.vramMiB} | ${m.contextLength} |`),
        ]
      : ['_No models currently resident in Ollama VRAM._']),
    '',
    '## GGUF & KV-Cache VRAM Estimate',
    '',
    `- **Inputs:** ${safeEst.inputs.paramsB}B params, \`${safeEst.inputs.quantization}\`, ctx \`${safeEst.inputs.contextLen}\`, KV \`${safeEst.inputs.kvPrecision}\`, GPU \`${safeEst.inputs.gpuVramGiB} GiB\``,
    `- **Breakdown:** Weights \`${safeEst.breakdown.weightMiB} MiB\` + KV Cache \`${safeEst.breakdown.kvCacheMiB} MiB\` + Overhead \`${safeEst.breakdown.overheadMiB} MiB\` = **\`${safeEst.breakdown.totalMiB} MiB\`** (\`${safeEst.breakdown.utilizationPct}%\`)`,
    `- **Verdict:** **\`${safeEst.verdict}\`** — ${safeEst.verdictSummary}`,
    '',
    '## Model Catalog',
    '',
    '| Provider | Model | Params | Quant | Size (GiB) | Context | Host GPU Fit |',
    '| :--- | :--- | :---: | :---: | :---: | :---: | :---: |',
    ...(safeSnap.models || []).map((m) => `| ${m.providerId} | \`${m.name}\` | ${m.paramLabel} | ${m.quantization} | ${m.sizeGiB} | ${m.contextLength} | ${m.hostGpuVerdict} |`),
  ];
  const markdown = mdLines.join('\n');

  const csvHeader = [
    'provider',
    'model_id',
    'display_name',
    'family',
    'params_b',
    'quantization',
    'size_gib',
    'context_length',
    'loaded_vram_mib',
    'host_gpu_fit',
    'capabilities',
  ].join(',');

  const csvRows = (safeSnap.models || []).map((m) => [
    csvEscape(m.providerId),
    csvEscape(m.name),
    csvEscape(m.displayName),
    csvEscape(m.family),
    csvEscape(m.paramsB ?? ''),
    csvEscape(m.quantization),
    csvEscape(m.sizeGiB),
    csvEscape(m.contextLength),
    csvEscape(m.vramMiB),
    csvEscape(m.hostGpuVerdict),
    csvEscape((m.capabilities || []).join('|')),
  ].join(','));

  const csv = [csvHeader, ...csvRows].join('\n');

  return { json, markdown, csv, receiptSha256 };
}
