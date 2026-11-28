/**
 * Zoth Studio v2 — Six Mathematical Pillars & Byzantine BFT Deterministic Engine
 * Pure zero-dependency ESM module shared byte-identically between browser UI
 * (src/utils/mathPillarsEngine.js) and loopback Studio API (server/math-pillars-engine.mjs).
 *
 * Security & Numerical Invariants:
 *  - Pure deterministic arithmetic with zero dynamic code evaluation or PRNG randomness
 *  - Strict finite-number guards (NaN / Infinity / 0 safe)
 *  - Exact STDP neutral boundary: deltaW(0) === 0
 *  - Clamped Lyapunov exponentiation: exp(clamp(lambda * t, -50, 50))
 *  - Formula-safe CSV / Markdown / LaTeX / JSON exporters + FIPS 180-4 SHA-256 receipts
 */

export const MATH_PILLARS_ENGINE_VERSION = '2.3.0';

export const PILLAR_IDS = Object.freeze([
  'linear',
  'calculus',
  'probability',
  'hessian',
  'lyapunov',
  'stdp',
  'bft',
]);

export const PILLAR_CATALOG = Object.freeze([
  {
    id: 'linear',
    numeral: 'I',
    title: 'Linear Algebra',
    shortTitle: 'Linear Algebra',
    subtitle: 'Tensors, cosine geometry, scaled dot-product attention & KV-cache bounds',
    formula: 'Attention(Q,K,V) = softmax(Q·Kᵀ / √d_k)·V  |  M_KV = 2·L·H·d_h·S·bytes',
    latex: '\\operatorname{Attention}(Q,K,V)=\\operatorname{softmax}\\!\\left(\\frac{QK^\\top}{\\sqrt{d_k}}\\right)V, \\quad M_{\\text{KV}}=2 L H d_h S b',
    docsRoute: '/docs/math/linear',
  },
  {
    id: 'calculus',
    numeral: 'II',
    title: 'Multivariable Calculus',
    shortTitle: 'Calculus & AdamW',
    subtitle: 'Decoupled AdamW trajectories, L2 gradient clipping & LoRA rank budgets',
    formula: 'θ_{t+1} = θ_t(1 − ηλ) − η · m̂_t / (√v̂_t + ε)  |  LoRA = r(d_in + d_out)',
    latex: '\\theta_{t+1}=\\theta_t(1-\\eta\\lambda)-\\eta\\frac{\\hat{m}_t}{\\sqrt{\\hat{v}_t}+\\varepsilon}, \\quad P_{\\text{LoRA}}=r(d_{\\text{in}}+d_{\\text{out}})',
    docsRoute: '/docs/math/calculus',
  },
  {
    id: 'probability',
    numeral: 'III',
    title: 'Probability & Info Theory',
    shortTitle: 'Probability & Entropy',
    subtitle: 'Log-sum-exp softmax, top-p nucleus sampling, Shannon entropy & KL divergence',
    formula: 'H(X) = −Σ p_i log₂(p_i)  |  PPL = 2^H  |  D_KL(P ‖ Q) = Σ p_i log₂(p_i / q_i)',
    latex: 'H(X)=-\\sum_i p_i\\log_2 p_i, \\quad \\operatorname{PPL}=2^{H(X)}, \\quad D_{\\mathrm{KL}}(P\\|Q)=\\sum_i p_i\\log_2\\frac{p_i}{q_i}',
    docsRoute: '/docs/math/probability',
  },
  {
    id: 'hessian',
    numeral: 'IV',
    title: 'Hessian & Loss Manifolds',
    shortTitle: 'Hessian Curvature',
    subtitle: 'Symmetric 2×2 eigenspectra, condition number κ(H), definiteness & matrix-free HVP',
    formula: 'H = ∇²L(θ)  |  κ(H) = |λ_max| / |λ_min|  |  Hv ≈ (∇L(θ+εv) − ∇L(θ−εv)) / (2ε)',
    latex: 'H=\\nabla^2 L(\\theta), \\quad \\kappa(H)=\\frac{|\\lambda_{\\max}|}{|\\lambda_{\\min}|}, \\quad Hv\\approx\\frac{\\nabla L(\\theta+\\varepsilon v)-\\nabla L(\\theta-\\varepsilon v)}{2\\varepsilon}',
    docsRoute: '/docs/math/hessian',
  },
  {
    id: 'lyapunov',
    numeral: 'V',
    title: 'Lyapunov & Phase Dynamics',
    shortTitle: 'Lyapunov Stability',
    subtitle: 'Clamped orbital divergence, dual-trajectory λ estimation & coherence index',
    formula: '‖δZ(t)‖ / ‖δZ(0)‖ = exp(clamp(λ·t, −50, 50))  |  C = exp(−H / H_max)',
    latex: '\\frac{\\|\\delta Z(t)\\|}{\\|\\delta Z(0)\\|}=\\exp(\\operatorname{clamp}(\\lambda t,-50,50)), \\quad C=\\exp\\!\\left(-\\frac{H}{H_{\\max}}\\right)',
    docsRoute: '/docs/math/lyapunov',
  },
  {
    id: 'stdp',
    numeral: 'VI',
    title: 'Neuromorphic STDP',
    shortTitle: 'Neuromorphic STDP',
    subtitle: 'Causal LTP / anti-causal LTD plasticity with neutral Δw(0) = 0 & bounded traces',
    formula: 'Δw(Δt) = +A₊e^(−Δt/τ₊) [Δt>0],  0 [Δt=0],  −A₋e^(Δt/τ₋) [Δt<0]',
    latex: '\\Delta w(\\Delta t)=\\begin{cases}+A_+ e^{-\\Delta t/\\tau_+} & \\Delta t>0 \\\\ 0 & \\Delta t=0 \\\\ -A_- e^{\\Delta t/\\tau_-} & \\Delta t<0\\end{cases}',
    docsRoute: '/docs/math/stdp',
  },
  {
    id: 'bft',
    numeral: 'VII',
    title: 'Byzantine BFT Quorum',
    shortTitle: 'Byzantine BFT',
    subtitle: 'Swarm consensus safety & liveness bounds (N ≥ 3f + 1, Q = 2f + 1)',
    formula: 'N ≥ 3f + 1  |  Q = 2f + 1  |  f_max = ⌊(N − 1) / 3⌋',
    latex: 'N \\ge 3f + 1, \\quad Q = 2f + 1, \\quad f_{\\max}=\\left\\lfloor\\frac{N-1}{3}\\right\\rfloor',
    docsRoute: '/workstations/consensus',
  },
]);

export function clamp(val, lo, hi) {
  if (!Number.isFinite(val)) return lo;
  return Math.min(hi, Math.max(lo, val));
}

export function finiteNum(val, fallback = 0, min = -1e9, max = 1e9) {
  const n = typeof val === 'number' ? val : Number(val);
  if (!Number.isFinite(n)) return fallback;
  return clamp(n, min, max);
}

export function round(val, digits = 6) {
  if (!Number.isFinite(val)) return 0;
  const factor = Math.pow(10, digits);
  const r = Math.round((val + Number.EPSILON) * factor) / factor;
  return Object.is(r, -0) ? 0 : r;
}

export function parseNumberList(input, fallback = [], maxLen = 16, min = -1e6, max = 1e6) {
  if (Array.isArray(input)) {
    const cleaned = input
      .slice(0, maxLen)
      .map((x) => Number(x))
      .filter((x) => Number.isFinite(x))
      .map((x) => clamp(x, min, max));
    return cleaned.length > 0 ? cleaned : [...fallback];
  }
  if (typeof input === 'string') {
    const cleaned = input
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, maxLen)
      .map((s) => Number(s))
      .filter((x) => Number.isFinite(x))
      .map((x) => clamp(x, min, max));
    return cleaned.length > 0 ? cleaned : [...fallback];
  }
  return [...fallback];
}

export function redactHomePaths(str) {
  return String(str ?? '').replace(/\/home\/[a-zA-Z0-9._-]+\//g, '~/');
}

export function sanitizeCsvCell(val) {
  const raw = redactHomePaths(val === null || val === undefined ? '' : String(val));
  const neutralized = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${neutralized.replace(/"/g, '""')}"`;
}

/**
 * Pure zero-dependency synchronous FIPS 180-4 SHA-256 (UTF-8 string -> 64-char hex).
 */
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
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let cp = str.charCodeAt(i);
    if (cp >= 0xd800 && cp <= 0xdbff && i + 1 < str.length) {
      const lo = str.charCodeAt(++i);
      cp = ((cp - 0xd800) << 10) + (lo - 0xdc00) + 0x10000;
    }
    if (cp < 0x80) {
      bytes.push(cp);
    } else if (cp < 0x800) {
      bytes.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    } else if (cp < 0x10000) {
      bytes.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else {
      bytes.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f),
      );
    }
  }
  return new Uint8Array(bytes);
}

export function sha256Hex(message) {
  const msg = utf8ToBytes(String(message ?? ''));
  const bitLen = msg.length * 8;
  const paddedLen = Math.ceil((msg.length + 9) / 64) * 64;
  const buf = new Uint8Array(paddedLen);
  buf.set(msg);
  buf[msg.length] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;
  const w = new Uint32Array(64);

  for (let off = 0; off < paddedLen; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^ ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3);
      const s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^ ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
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
  return [h0, h1, h2, h3, h4, h5, h6, h7].map((x) => x.toString(16).padStart(8, '0')).join('');
}

function stableSoftmax(values, temperature = 1.0) {
  const tau = clamp(finiteNum(temperature, 1.0, 0.05, 10.0), 0.05, 10.0);
  const scaled = values.map((v) => v / tau);
  const maxVal = Math.max(...scaled);
  const exps = scaled.map((v) => Math.exp(clamp(v - maxVal, -60, 60)));
  const sumExp = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((e) => e / sumExp);
}

/**
 * Pillar I — Linear Algebra: dot product, L2 norms, cosine similarity,
 * scaled dot-product attention softmax(Q·Kᵀ/√d_k)·V, and KV-cache estimator.
 */
export function solveLinearAlgebra(params = {}) {
  const rawA = parseNumberList(params.vectorA, [1.2, 0.8, -0.4, 0.9], 16);
  const rawB = parseNumberList(params.vectorB, [0.9, 1.1, -0.2, 0.5], 16);
  const dim = Math.max(rawA.length, rawB.length, 1);
  const vectorA = Array.from({ length: dim }, (_, i) => (i < rawA.length ? rawA[i] : 0));
  const vectorB = Array.from({ length: dim }, (_, i) => (i < rawB.length ? rawB[i] : 0));

  let dotProduct = 0;
  let normSqA = 0;
  let normSqB = 0;
  for (let i = 0; i < dim; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normSqA += vectorA[i] * vectorA[i];
    normSqB += vectorB[i] * vectorB[i];
  }
  const normA = Math.sqrt(normSqA);
  const normB = Math.sqrt(normSqB);
  const denom = normA * normB;
  const cosineSimilarity = denom > 1e-12 ? clamp(dotProduct / denom, -1, 1) : 0;
  const angleDeg = denom > 1e-12 ? (Math.acos(cosineSimilarity) * 180) / Math.PI : 90;

  // Scaled dot-product attention with Q = vectorA against 4 deterministic keys derived/provided
  const keys = Array.isArray(params.keys) && params.keys.length >= 2
    ? params.keys.slice(0, 6).map((k) => {
        const parsed = parseNumberList(k, vectorB, dim);
        return Array.from({ length: dim }, (_, i) => (i < parsed.length ? parsed[i] : 0));
      })
    : [
        vectorB,
        vectorA.map((v, i) => round(v * (i % 2 === 0 ? 0.85 : 0.65), 4)),
        vectorB.map((v) => round(-0.5 * v, 4)),
        vectorA.map((v, i) => round((v + vectorB[i]) * 0.5, 4)),
      ];
  const values = Array.isArray(params.values) && params.values.length === keys.length
    ? params.values.map((v) => finiteNum(v, 0))
    : keys.map((_, idx) => round(1.0 + idx * 0.5, 3));

  const layers = Math.round(finiteNum(params.layers, 32, 1, 256));
  const heads = Math.round(finiteNum(params.heads, 16, 1, 256));
  const dHead = Math.round(finiteNum(params.dHead, 128, 8, 1024));
  const seqLen = Math.round(finiteNum(params.seqLen, 4096, 64, 262144));
  const dtypeBytes = Math.round(finiteNum(params.dtypeBytes, 2, 1, 8));
  const dModel = heads * dHead;

  const scaleFactor = Math.sqrt(Math.max(1, dim));
  const rawScores = keys.map((k) => k.reduce((acc, kv, idx) => acc + kv * vectorA[idx], 0));
  const scaledScores = rawScores.map((s) => s / scaleFactor);
  const attentionWeights = stableSoftmax(scaledScores, 1.0);
  const attentionOutput = attentionWeights.reduce((acc, w, idx) => acc + w * values[idx], 0);

  const kvCacheBytes = 2 * layers * heads * dHead * seqLen * dtypeBytes;
  const kvCacheMiB = kvCacheBytes / (1024 * 1024);
  const kvCacheGiB = kvCacheMiB / 1024;

  const seqPoints = [512, 1024, 2048, 4096, 8192, 16384];
  const series = seqPoints.map((s) => ({
    x: s,
    label: `${s}`,
    y: round((2 * layers * heads * dHead * s * dtypeBytes) / (1024 * 1024), 2),
  }));

  const metrics = [
    { label: 'Dot Product (A · B)', value: `${round(dotProduct, 4)}` },
    { label: 'L2 Norms (‖A‖₂, ‖B‖₂)', value: `${round(normA, 4)}, ${round(normB, 4)}` },
    { label: 'Cosine Similarity cos(θ)', value: `${round(cosineSimilarity, 5)} (${round(angleDeg, 2)}°)` },
    { label: 'Embedding Dim d_model', value: `${dModel} (${heads} × ${dHead})` },
    { label: 'Scaled Attention Output', value: `${round(attentionOutput, 5)}` },
    { label: `KV-Cache (${seqLen} tok, ${dtypeBytes}B)`, value: `${round(kvCacheMiB, 2)} MiB (${round(kvCacheGiB, 3)} GiB)` },
  ];

  const steps = [
    `1. Aligned dimension d = ${dim}: A = [${vectorA.map((v) => round(v, 3)).join(', ')}], B = [${vectorB.map((v) => round(v, 3)).join(', ')}].`,
    `2. Inner product A · B = ${round(dotProduct, 5)}, ‖A‖₂ = ${round(normA, 5)}, ‖B‖₂ = ${round(normB, 5)}.`,
    `3. cos(θ) = (A · B) / (‖A‖₂ · ‖B‖₂) = ${round(cosineSimilarity, 6)} ⇒ θ = ${round(angleDeg, 2)}°.`,
    `4. Scaled dot-product scores Q·Kᵀ / √${dim} = [${scaledScores.map((s) => round(s, 4)).join(', ')}] → softmax weights = [${attentionWeights.map((w) => round(w, 4)).join(', ')}] → weighted V = ${round(attentionOutput, 5)}.`,
    `5. KV-Cache footprint M_KV = 2 · ${layers} · ${heads} · ${dHead} · ${seqLen} · ${dtypeBytes} B = ${kvCacheBytes.toLocaleString('en-US')} B (${round(kvCacheMiB, 2)} MiB).`,
  ];

  return {
    pillarId: 'linear',
    title: 'Linear Algebra',
    formula: 'Attention(Q,K,V) = softmax(Q·Kᵀ / √d_k)·V  |  M_KV = 2·L·H·d_h·S·bytes',
    summary: `cos(θ) = ${round(cosineSimilarity, 4)} (${round(angleDeg, 1)}°), attention output = ${round(attentionOutput, 4)}, KV-cache = ${round(kvCacheMiB, 2)} MiB at S = ${seqLen}.`,
    metrics,
    steps,
    chart: { xLabel: 'Sequence Length (tokens)', yLabel: 'KV-Cache (MiB)', points: series },
    data: {
      dim,
      vectorA,
      vectorB,
      dotProduct: round(dotProduct, 6),
      normA: round(normA, 6),
      normB: round(normB, 6),
      cosineSimilarity: round(cosineSimilarity, 6),
      angleDeg: round(angleDeg, 4),
      rawScores: rawScores.map((s) => round(s, 6)),
      scaledScores: scaledScores.map((s) => round(s, 6)),
      attentionWeights: attentionWeights.map((w) => round(w, 6)),
      attentionOutput: round(attentionOutput, 6),
      layers,
      heads,
      dHead,
      dModel,
      seqLen,
      dtypeBytes,
      kvCacheBytes,
      kvCacheMiB: round(kvCacheMiB, 4),
      kvCacheGiB: round(kvCacheGiB, 6),
    },
  };
}

/**
 * Pillar II — Multivariable Calculus: decoupled AdamW optimizer trajectory,
 * L2 gradient norm clipping, and LoRA parameter budget.
 */
export function solveMultivariableCalculus(params = {}) {
  const lr = finiteNum(params.learningRate, 0.05, 1e-6, 1.0);
  const beta1 = finiteNum(params.beta1, 0.9, 0.0, 0.999);
  const beta2 = finiteNum(params.beta2, 0.999, 0.0, 0.9999);
  const weightDecay = finiteNum(params.weightDecay, 0.01, 0.0, 0.5);
  const gradClip = finiteNum(params.gradClip, 1.0, 0.05, 100.0);
  const theta0 = finiteNum(params.theta0, 2.5, -50, 50);
  const curvature = finiteNum(params.curvature, 1.2, 0.05, 20.0);
  const stepsCount = Math.round(finiteNum(params.steps, 20, 1, 60));
  const loraRank = Math.round(finiteNum(params.loraRank, 16, 1, 512));
  const dIn = Math.round(finiteNum(params.dIn, 4096, 16, 65536));
  const dOut = Math.round(finiteNum(params.dOut, 4096, 16, 65536));
  const loraAlpha = finiteNum(params.loraAlpha, 32, 1, 1024);
  const eps = 1e-8;

  let theta = theta0;
  let m = 0;
  let v = 0;
  const trajectory = [];
  let clippedCount = 0;

  for (let t = 1; t <= stepsCount; t++) {
    const rawGrad = curvature * theta;
    const rawNorm = Math.abs(rawGrad);
    const clipScale = rawNorm > gradClip ? gradClip / rawNorm : 1.0;
    if (clipScale < 1.0) clippedCount += 1;
    const g = rawGrad * clipScale;

    m = beta1 * m + (1 - beta1) * g;
    v = beta2 * v + (1 - beta2) * g * g;
    const mHat = m / Math.max(1e-12, 1 - Math.pow(beta1, t));
    const vHat = v / Math.max(1e-12, 1 - Math.pow(beta2, t));

    const decayStep = lr * weightDecay * theta;
    const adamStep = (lr * mHat) / (Math.sqrt(vHat) + eps);
    const prevTheta = theta;
    theta = theta - decayStep - adamStep;
    const loss = 0.5 * curvature * theta * theta;

    trajectory.push({
      step: t,
      theta: round(theta, 6),
      loss: round(loss, 6),
      rawGrad: round(rawGrad, 6),
      clippedGrad: round(g, 6),
      mHat: round(mHat, 6),
      vHat: round(vHat, 6),
      deltaTheta: round(theta - prevTheta, 6),
    });
  }

  const initialLoss = 0.5 * curvature * theta0 * theta0;
  const finalPoint = trajectory[trajectory.length - 1];
  const fullParams = dIn * dOut;
  const loraParams = loraRank * (dIn + dOut);
  const loraRatioPct = fullParams > 0 ? (loraParams / fullParams) * 100 : 0;
  const loraScale = loraAlpha / loraRank;

  const series = [
    { x: 0, label: 't=0', y: round(initialLoss, 5) },
    ...trajectory.map((pt) => ({ x: pt.step, label: `t=${pt.step}`, y: pt.loss })),
  ];

  const metrics = [
    { label: 'Initial → Final θ', value: `${round(theta0, 4)} → ${finalPoint.theta}` },
    { label: 'Initial → Final Loss L(θ)', value: `${round(initialLoss, 4)} → ${finalPoint.loss}` },
    { label: 'Last Step Δθ', value: `${finalPoint.deltaTheta}` },
    { label: 'Clipped Steps (‖g‖₂ > clip)', value: `${clippedCount} / ${stepsCount} (clip=${round(gradClip, 2)})` },
    { label: `LoRA Params r=${loraRank}`, value: `${loraParams.toLocaleString('en-US')} (${round(loraRatioPct, 3)}% of full)` },
    { label: 'LoRA Scaling (α / r)', value: `${round(loraScale, 3)}` },
  ];

  const steps = [
    `1. Quadratic loss manifold L(θ) = ½·${round(curvature, 3)}·θ² with θ₀ = ${round(theta0, 4)}, L(θ₀) = ${round(initialLoss, 5)}.`,
    `2. Decoupled AdamW: η = ${lr}, β₁ = ${beta1}, β₂ = ${beta2}, λ = ${weightDecay}, L2 clip = ${gradClip}.`,
    `3. Executed ${stepsCount} deterministic steps (${clippedCount} clipped); θ converged to ${finalPoint.theta} with final loss ${finalPoint.loss}.`,
    `4. Last moment estimates: m̂ = ${finalPoint.mHat}, v̂ = ${finalPoint.vHat}, Δθ = ${finalPoint.deltaTheta}.`,
    `5. Low-Rank Adaptation: r·(d_in + d_out) = ${loraRank}·(${dIn} + ${dOut}) = ${loraParams.toLocaleString('en-US')} params vs ${fullParams.toLocaleString('en-US')} full (${round(loraRatioPct, 3)}%).`,
  ];

  return {
    pillarId: 'calculus',
    title: 'Multivariable Calculus',
    formula: 'θ_{t+1} = θ_t(1 − ηλ) − η · m̂_t / (√v̂_t + ε)  |  LoRA = r(d_in + d_out)',
    summary: `AdamW reduced L(θ) from ${round(initialLoss, 4)} to ${finalPoint.loss} in ${stepsCount} steps (${clippedCount} clipped); LoRA uses ${round(loraRatioPct, 2)}% of full weights.`,
    metrics,
    steps,
    chart: { xLabel: 'Optimizer Step (t)', yLabel: 'Loss L(θ)', points: series },
    data: {
      learningRate: lr,
      beta1,
      beta2,
      weightDecay,
      gradClip,
      theta0,
      curvature,
      steps: stepsCount,
      clippedCount,
      initialLoss: round(initialLoss, 6),
      finalTheta: finalPoint.theta,
      finalLoss: finalPoint.loss,
      lastDeltaTheta: finalPoint.deltaTheta,
      loraRank,
      dIn,
      dOut,
      loraAlpha,
      loraScale: round(loraScale, 6),
      fullParams,
      loraParams,
      loraRatioPct: round(loraRatioPct, 6),
      trajectory,
    },
  };
}

/**
 * Pillar III — Probability & Info Theory: log-sum-exp softmax, top-p nucleus,
 * Shannon entropy H(X), perplexity 2^H, and KL divergence D_KL(P || Q).
 */
export function solveProbabilityInfo(params = {}) {
  const logits = parseNumberList(params.logits, [2.4, 1.1, -0.5, 0.2, -1.2], 16, -50, 50);
  const tau = finiteNum(params.temperature, 0.7, 0.05, 5.0);
  const topP = finiteNum(params.topP, 0.9, 0.05, 1.0);

  const probs = stableSoftmax(logits, tau);
  const n = probs.length;

  // Reference distribution Q (uniform by default or user-provided qLogits)
  const qProbs = params.qLogits
    ? stableSoftmax(
        Array.from({ length: n }, (_, i) => {
          const ql = parseNumberList(params.qLogits, logits, 16, -50, 50);
          return i < ql.length ? ql[i] : 0;
        }),
        1.0,
      )
    : Array.from({ length: n }, () => 1 / n);

  // Shannon entropy H(X) = -sum p_i log2(p_i)
  let entropyBits = 0;
  let klDivergenceBits = 0;
  for (let i = 0; i < n; i++) {
    const p = probs[i];
    const q = Math.max(qProbs[i], 1e-12);
    if (p > 1e-15) {
      entropyBits -= p * Math.log2(p);
      klDivergenceBits += p * Math.log2(p / q);
    }
  }
  const maxEntropyBits = n > 1 ? Math.log2(n) : 0;
  const perplexity = Math.pow(2, clamp(entropyBits, 0, 50));

  // Top-p nucleus mask (sorted descending, retain minimal prefix >= topP)
  const indexed = probs.map((p, idx) => ({ idx, logit: logits[idx], prob: p }));
  const sorted = [...indexed].sort((a, b) => b.prob - a.prob || a.idx - b.idx);
  let cumulative = 0;
  const keptSet = new Set();
  for (const item of sorted) {
    keptSet.add(item.idx);
    cumulative += item.prob;
    if (cumulative >= topP - 1e-12) break;
  }
  const keptSum = indexed.reduce((acc, it) => acc + (keptSet.has(it.idx) ? it.prob : 0), 0) || 1;
  const tokens = indexed.map((it) => ({
    token: `w${it.idx}`,
    logit: round(it.logit, 4),
    prob: round(it.prob, 6),
    inNucleus: keptSet.has(it.idx),
    nucleusProb: round(keptSet.has(it.idx) ? it.prob / keptSum : 0, 6),
  }));

  const series = tokens.map((tk, idx) => ({
    x: idx,
    label: tk.token,
    y: round(tk.prob * 100, 2),
  }));

  const metrics = [
    { label: 'Temperature (τ)', value: `${round(tau, 3)}` },
    { label: 'Top Token Probability P(w*)', value: `${round(sorted[0].prob, 5)} (${tokens[sorted[0].idx].token})` },
    { label: 'Shannon Entropy H(X)', value: `${round(entropyBits, 4)} / ${round(maxEntropyBits, 4)} bits` },
    { label: 'Perplexity (2^H)', value: `${round(perplexity, 4)}` },
    { label: `Top-p Nucleus (p=${round(topP, 2)})`, value: `${keptSet.size} / ${n} tokens kept` },
    { label: 'KL Divergence D_KL(P ‖ Q)', value: `${round(klDivergenceBits, 4)} bits` },
  ];

  const steps = [
    `1. Input logits z = [${logits.map((v) => round(v, 2)).join(', ')}], temperature τ = ${round(tau, 3)}.`,
    `2. Log-sum-exp shifted softmax P(wᵢ) = [${probs.map((p) => round(p, 4)).join(', ')}] (ΣP = ${round(probs.reduce((a, b) => a + b, 0), 6)}).`,
    `3. Top-p = ${round(topP, 2)} retains ${keptSet.size}/${n} tokens (pre-renorm mass = ${round(keptSum, 4)}).`,
    `4. Shannon entropy H(X) = −Σ pᵢ log₂ pᵢ = ${round(entropyBits, 5)} bits ⇒ Perplexity 2^H = ${round(perplexity, 4)}.`,
    `5. KL divergence against ${params.qLogits ? 'target Q' : 'uniform Q'}: D_KL(P ‖ Q) = ${round(klDivergenceBits, 5)} bits.`,
  ];

  return {
    pillarId: 'probability',
    title: 'Probability & Info Theory',
    formula: 'H(X) = −Σ p_i log₂(p_i)  |  PPL = 2^H  |  D_KL(P ‖ Q) = Σ p_i log₂(p_i / q_i)',
    summary: `H(X) = ${round(entropyBits, 4)} bits (PPL ${round(perplexity, 3)}), top-p retains ${keptSet.size}/${n} tokens, D_KL = ${round(klDivergenceBits, 4)} bits.`,
    metrics,
    steps,
    chart: { xLabel: 'Token Index', yLabel: 'Probability (%)', points: series },
    data: {
      logits,
      temperature: tau,
      topP,
      probs: probs.map((p) => round(p, 6)),
      tokens,
      nucleusCount: keptSet.size,
      entropyBits: round(entropyBits, 6),
      maxEntropyBits: round(maxEntropyBits, 6),
      perplexity: round(perplexity, 6),
      klDivergenceBits: round(klDivergenceBits, 6),
    },
  };
}

/**
 * Pillar IV — Hessian & Loss Manifolds: symmetric 2x2 eigenvalues, trace, det,
 * condition number κ(H), definiteness classification, and matrix-free HVP.
 */
export function solveHessianManifolds(params = {}) {
  const h11 = finiteNum(params.h11, 4.2, -1000, 1000);
  const h12 = finiteNum(params.h12, 1.1, -1000, 1000);
  const h22 = finiteNum(params.h22, 1.4, -1000, 1000);
  const v1 = finiteNum(params.v1, 1.0, -100, 100);
  const v2 = finiteNum(params.v2, 0.5, -100, 100);
  const eps = finiteNum(params.eps, 1e-4, 1e-7, 1e-1);

  const trace = h11 + h22;
  const determinant = h11 * h22 - h12 * h12;
  const disc = Math.sqrt((h11 - h22) * (h11 - h22) + 4 * h12 * h12);
  const lambda1 = 0.5 * (trace + disc);
  const lambda2 = 0.5 * (trace - disc);

  const absMax = Math.max(Math.abs(lambda1), Math.abs(lambda2));
  const absMin = Math.min(Math.abs(lambda1), Math.abs(lambda2));
  const isSingular = absMin <= 1e-12;
  const conditionNumber = isSingular ? null : absMax / absMin;

  let classification = 'Degenerate / Semidefinite Ridge';
  if (lambda1 > 1e-9 && lambda2 > 1e-9) {
    classification = 'Positive-Definite Bowl (Local Minimum)';
  } else if (lambda1 < -1e-9 && lambda2 < -1e-9) {
    classification = 'Negative-Definite Concave (Local Maximum)';
  } else if (lambda1 * lambda2 < -1e-9) {
    classification = 'Indefinite Saddle Point';
  }

  // Exact H*v vs finite-difference HVP on quadratic L(x) = 0.5 * x^T H x
  const gradAt = (x1, x2) => [h11 * x1 + h12 * x2, h12 * x1 + h22 * x2];
  const exactHvp = gradAt(v1, v2);
  const gPlus = gradAt(eps * v1, eps * v2);
  const gMinus = gradAt(-eps * v1, -eps * v2);
  const fdHvp = [(gPlus[0] - gMinus[0]) / (2 * eps), (gPlus[1] - gMinus[1]) / (2 * eps)];
  const hvpResidual = Math.hypot(fdHvp[0] - exactHvp[0], fdHvp[1] - exactHvp[1]);

  // Directional curvature slice along angle phi in [0, 180] deg: u(phi)^T H u(phi)
  const series = [];
  for (let deg = 0; deg <= 180; deg += 15) {
    const rad = (deg * Math.PI) / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const curv = h11 * c * c + 2 * h12 * c * s + h22 * s * s;
    series.push({ x: deg, label: `${deg}°`, y: round(curv, 4) });
  }

  const metrics = [
    { label: 'Eigenvalues (λ₁, λ₂)', value: `${round(lambda1, 4)}, ${round(lambda2, 4)}` },
    { label: 'Trace / Determinant', value: `tr=${round(trace, 4)} · det=${round(determinant, 4)}` },
    { label: 'Condition Number κ(H)', value: conditionNumber === null ? 'Singular (∞)' : `${round(conditionNumber, 4)}` },
    { label: 'Manifold Geometry', value: classification },
    { label: 'Matrix-Free HVP (H·v)', value: `[${round(fdHvp[0], 4)}, ${round(fdHvp[1], 4)}]` },
    { label: 'HVP FD Residual ‖e‖₂', value: `${hvpResidual.toExponential(2)}` },
  ];

  const steps = [
    `1. Symmetric Hessian H = [[${round(h11, 3)}, ${round(h12, 3)}], [${round(h12, 3)}, ${round(h22, 3)}]].`,
    `2. Characteristic invariants: tr(H) = ${round(trace, 4)}, det(H) = ${round(determinant, 4)}, Δ = √((h₁₁−h₂₂)² + 4h₁₂²) = ${round(disc, 4)}.`,
    `3. Analytic spectrum: λ₁ = ${round(lambda1, 5)}, λ₂ = ${round(lambda2, 5)} ⇒ ${classification}.`,
    `4. Condition number κ(H) = |λ_max| / |λ_min| = ${conditionNumber === null ? '∞ (degenerate)' : round(conditionNumber, 5)}.`,
    `5. Matrix-free HVP for v = [${round(v1, 3)}, ${round(v2, 3)}] (ε=${eps}): [${round(fdHvp[0], 5)}, ${round(fdHvp[1], 5)}] vs exact [${round(exactHvp[0], 5)}, ${round(exactHvp[1], 5)}] (residual ${hvpResidual.toExponential(2)}).`,
  ];

  return {
    pillarId: 'hessian',
    title: 'Hessian & Loss Manifolds',
    formula: 'H = ∇²L(θ)  |  κ(H) = |λ_max| / |λ_min|  |  Hv ≈ (∇L(θ+εv) − ∇L(θ−εv)) / (2ε)',
    summary: `λ = (${round(lambda1, 3)}, ${round(lambda2, 3)}), ${classification}, κ(H) = ${conditionNumber === null ? '∞' : round(conditionNumber, 3)}.`,
    metrics,
    steps,
    chart: { xLabel: 'Direction Angle φ (°)', yLabel: 'Directional Curvature uᵀHu', points: series },
    data: {
      matrix: [
        [h11, h12],
        [h12, h22],
      ],
      trace: round(trace, 6),
      determinant: round(determinant, 6),
      lambda1: round(lambda1, 6),
      lambda2: round(lambda2, 6),
      conditionNumber: conditionNumber === null ? null : round(conditionNumber, 6),
      isSingular,
      classification,
      vector: [v1, v2],
      exactHvp: exactHvp.map((x) => round(x, 6)),
      fdHvp: fdHvp.map((x) => round(x, 6)),
      hvpResidual,
    },
  };
}

/**
 * Pillar V — Lyapunov & Phase Dynamics: clamped exponential divergence,
 * dual-trajectory OLS max Lyapunov estimator, stability classification & coherence index.
 */
export function solveLyapunovDynamics(params = {}) {
  const lambda = finiteNum(params.lambda, -0.42, -20, 20);
  const timeSec = finiteNum(params.timeSec, 4.0, 0.0, 200.0);
  const delta0 = finiteNum(params.delta0, 0.01, 1e-6, 100.0);
  const entropyH = finiteNum(params.entropyH, 0.34, 0.0, 50.0);
  const maxEntropyH = finiteNum(params.maxEntropyH, 4.0, 0.1, 50.0);

  const rawExponent = lambda * timeSec;
  const clampedExponent = clamp(rawExponent, -50, 50);
  const wasClamped = Math.abs(rawExponent - clampedExponent) > 1e-12;
  const divergenceRatio = Math.exp(clampedExponent);
  const finalSeparation = delta0 * divergenceRatio;

  // Dual-trajectory OLS estimator over observed or deterministic samples
  const customSeps = params.separations
    ? parseNumberList(params.separations, [], 24, 1e-12, 1e12)
    : [];
  const sampleCount = customSeps.length >= 2 ? customSeps.length : 12;
  const dt = timeSec > 0 ? timeSec / Math.max(1, sampleCount - 1) : 0.5;
  const trajectory = [];
  for (let i = 0; i < sampleCount; i++) {
    const t = i * dt;
    const sep = customSeps.length >= 2
      ? Math.max(customSeps[i], 1e-12)
      : delta0 * Math.exp(clamp(lambda * t, -50, 50));
    trajectory.push({ t: round(t, 4), sep, lnRatio: Math.log(sep / Math.max(delta0, 1e-12)) });
  }

  // Ordinary least squares slope of ln(delta(t)/delta0) vs t
  const meanT = trajectory.reduce((a, p) => a + p.t, 0) / trajectory.length;
  const meanY = trajectory.reduce((a, p) => a + p.lnRatio, 0) / trajectory.length;
  let cov = 0;
  let varT = 0;
  for (const p of trajectory) {
    cov += (p.t - meanT) * (p.lnRatio - meanY);
    varT += (p.t - meanT) * (p.t - meanT);
  }
  const estimatedLambda = varT > 1e-12 ? cov / varT : lambda;

  let stabilityClass = 'Marginally Stable (Neutral Orbit)';
  if (lambda < -1e-6) {
    stabilityClass = 'Asymptotically Stable (Contracting Attractor)';
  } else if (lambda > 1e-6) {
    stabilityClass = 'Chaotic / Divergent Flow';
  }

  const coherenceIndex = Math.exp(-clamp(entropyH / maxEntropyH, 0, 50));
  const formatDiv = (v) => (v >= 1e6 || (v > 0 && v < 1e-4) ? v.toExponential(4) : `${round(v, 5)}`);

  const series = trajectory.map((pt) => ({
    x: pt.t,
    label: `${round(pt.t, 2)}s`,
    y: round(clamp(pt.lnRatio, -50, 50), 4),
  }));

  const metrics = [
    { label: 'Max Lyapunov Exponent (λ)', value: `${round(lambda, 4)} s⁻¹` },
    { label: 'Dual-Trajectory OLS λ̂', value: `${round(estimatedLambda, 4)} s⁻¹` },
    { label: 'Clamped Exponent λ·t', value: `${round(clampedExponent, 4)}${wasClamped ? ' (clamped ±50)' : ''}` },
    { label: 'Divergence ‖δZ(t)‖ / ‖δZ(0)‖', value: formatDiv(divergenceRatio) },
    { label: 'Stability Regime', value: stabilityClass },
    { label: 'Coherence C = exp(−H/H_max)', value: `${round(coherenceIndex, 5)}` },
  ];

  const steps = [
    `1. Orbit parameters: λ = ${round(lambda, 4)} s⁻¹, t = ${round(timeSec, 3)} s, initial separation δ₀ = ${delta0}.`,
    `2. Clamped exponent: clamp(λ·t, −50, 50) = ${round(clampedExponent, 5)}${wasClamped ? ` (clamped from ${round(rawExponent, 3)} to prevent overflow)` : ''}.`,
    `3. Divergence ratio: exp(${round(clampedExponent, 4)}) = ${formatDiv(divergenceRatio)} ⇒ ‖δZ(t)‖ = ${formatDiv(finalSeparation)}.`,
    `4. Dual-trajectory OLS estimate over ${trajectory.length} points: λ̂ = ${round(estimatedLambda, 5)} s⁻¹ (${stabilityClass}).`,
    `5. Phase coherence: C = exp(−${round(entropyH, 3)} / ${round(maxEntropyH, 3)}) = ${round(coherenceIndex, 5)}.`,
  ];

  return {
    pillarId: 'lyapunov',
    title: 'Lyapunov & Phase Dynamics',
    formula: '‖δZ(t)‖ / ‖δZ(0)‖ = exp(clamp(λ·t, −50, 50))  |  C = exp(−H / H_max)',
    summary: `λ = ${round(lambda, 3)} (${stabilityClass}), divergence = ${formatDiv(divergenceRatio)}, coherence C = ${round(coherenceIndex, 4)}.`,
    metrics,
    steps,
    chart: { xLabel: 'Time t (s)', yLabel: 'Log Divergence ln(‖δZ(t)‖/‖δZ(0)‖)', points: series },
    data: {
      lambda: round(lambda, 6),
      estimatedLambda: round(estimatedLambda, 6),
      timeSec: round(timeSec, 6),
      delta0,
      rawExponent: round(rawExponent, 6),
      clampedExponent: round(clampedExponent, 6),
      wasClamped,
      divergenceRatio,
      divergenceFormatted: formatDiv(divergenceRatio),
      finalSeparation,
      stabilityClass,
      entropyH: round(entropyH, 6),
      maxEntropyH: round(maxEntropyH, 6),
      coherenceIndex: round(coherenceIndex, 6),
    },
  };
}

/**
 * Pillar VI — Neuromorphic STDP: exact causal LTP / anti-causal LTD with neutral Δw(0) = 0,
 * full [-80, +80] ms curve generator, and bounded [0, 1] synapse weight update trace.
 */
export function computeStdpDeltaW(deltaTMs, aPlus = 0.85, aMinus = 0.45, tauPlus = 16.8, tauMinus = 33.7) {
  const dt = finiteNum(deltaTMs, 0, -500, 500);
  const ap = finiteNum(aPlus, 0.85, 0, 5);
  const am = finiteNum(aMinus, 0.45, 0, 5);
  const tp = finiteNum(tauPlus, 16.8, 0.5, 500);
  const tm = finiteNum(tauMinus, 33.7, 0.5, 500);

  if (Math.abs(dt) <= 1e-12) {
    return { deltaTMs: 0, deltaW: 0, regime: 'Neutral (Simultaneous Δt = 0)' };
  }
  if (dt > 0) {
    const dw = ap * Math.exp(-dt / tp);
    return { deltaTMs: round(dt, 4), deltaW: round(dw, 6), regime: 'LTP (Causal Potentiation)' };
  }
  const dw = -am * Math.exp(dt / tm);
  return { deltaTMs: round(dt, 4), deltaW: round(dw, 6), regime: 'LTD (Anti-Causal Depression)' };
}

export function solveStdpPlasticity(params = {}) {
  const deltaTMs = finiteNum(params.deltaTMs, 12.0, -120, 120);
  const aPlus = finiteNum(params.aPlus, 0.85, 0.01, 2.0);
  const aMinus = finiteNum(params.aMinus, 0.45, 0.01, 2.0);
  const tauPlus = finiteNum(params.tauPlus, 16.8, 1.0, 200.0);
  const tauMinus = finiteNum(params.tauMinus, 33.7, 1.0, 200.0);
  const initialWeight = finiteNum(params.initialWeight, 0.5, 0.0, 1.0);
  const learningRate = finiteNum(params.learningRate, 0.25, 0.01, 1.0);
  const spikeDeltas = parseNumberList(params.spikeDeltas, [12, 8, -15, 5, 0, 18, -22], 16, -120, 120);

  const single = computeStdpDeltaW(deltaTMs, aPlus, aMinus, tauPlus, tauMinus);

  // Full [-80, +80] ms curve (33 points at 5 ms resolution, explicitly including 0)
  const curve = [];
  for (let dt = -80; dt <= 80; dt += 5) {
    const pt = computeStdpDeltaW(dt, aPlus, aMinus, tauPlus, tauMinus);
    curve.push({ x: dt, label: `${dt}ms`, y: pt.deltaW, regime: pt.regime });
  }

  // Bounded [0, 1] multi-spike weight update trace
  let weight = initialWeight;
  const trace = [];
  for (let i = 0; i < spikeDeltas.length; i++) {
    const step = computeStdpDeltaW(spikeDeltas[i], aPlus, aMinus, tauPlus, tauMinus);
    const nextWeight = clamp(weight + learningRate * step.deltaW, 0, 1);
    trace.push({
      index: i + 1,
      deltaTMs: step.deltaTMs,
      deltaW: step.deltaW,
      regime: step.regime,
      weightBefore: round(weight, 6),
      weightAfter: round(nextWeight, 6),
    });
    weight = nextWeight;
  }

  const metrics = [
    { label: 'Spike Interval Δt = t_post − t_pre', value: `${single.deltaTMs} ms` },
    { label: 'Plasticity Regime', value: single.regime },
    { label: 'Synaptic Update Δw(Δt)', value: `${single.deltaW >= 0 ? '+' : ''}${single.deltaW}` },
    { label: 'Windows (τ₊ / τ₋)', value: `${round(tauPlus, 1)} ms / ${round(tauMinus, 1)} ms` },
    { label: 'Amplitudes (A₊ / A₋)', value: `${round(aPlus, 2)} / ${round(aMinus, 2)}` },
    { label: `Bounded Weight Trace (${spikeDeltas.length} spikes)`, value: `${round(initialWeight, 3)} → ${round(weight, 4)} ∈ [0, 1]` },
  ];

  const steps = [
    `1. Spike timing interval Δt = t_post − t_pre = ${single.deltaTMs} ms (A₊=${round(aPlus, 3)}, A₋=${round(aMinus, 3)}, τ₊=${round(tauPlus, 1)} ms, τ₋=${round(tauMinus, 1)} ms).`,
    single.deltaTMs === 0
      ? `2. Exact boundary Δt = 0 ms ⇒ Δw(0) = 0 (strictly neutral, neither LTP nor LTD).`
      : single.deltaTMs > 0
      ? `2. Causal firing (Δt > 0): Δw = +${round(aPlus, 3)}·exp(−${single.deltaTMs}/${round(tauPlus, 1)}) = +${single.deltaW} (LTP).`
      : `2. Anti-causal firing (Δt < 0): Δw = −${round(aMinus, 3)}·exp(${single.deltaTMs}/${round(tauMinus, 1)}) = ${single.deltaW} (LTD).`,
    `3. Generated ${curve.length}-point STDP curve across Δt ∈ [−80, +80] ms with zero crossing at Δt = 0.`,
    `4. Applied ${spikeDeltas.length}-spike trace [${spikeDeltas.join(', ')}] ms with η=${round(learningRate, 3)}: bounded synapse weight moved ${round(initialWeight, 4)} → ${round(weight, 4)} ∈ [0, 1].`,
  ];

  return {
    pillarId: 'stdp',
    title: 'Neuromorphic STDP',
    formula: 'Δw(Δt) = +A₊e^(−Δt/τ₊) [Δt>0],  0 [Δt=0],  −A₋e^(Δt/τ₋) [Δt<0]',
    summary: `At Δt = ${single.deltaTMs} ms, Δw = ${single.deltaW} (${single.regime}); bounded trace ${round(initialWeight, 3)} → ${round(weight, 4)}.`,
    metrics,
    steps,
    chart: { xLabel: 'Spike Timing Δt (ms)', yLabel: 'Synaptic Change Δw', points: curve },
    data: {
      deltaTMs: single.deltaTMs,
      deltaW: single.deltaW,
      regime: single.regime,
      aPlus: round(aPlus, 6),
      aMinus: round(aMinus, 6),
      tauPlus: round(tauPlus, 6),
      tauMinus: round(tauMinus, 6),
      initialWeight: round(initialWeight, 6),
      finalWeight: round(weight, 6),
      learningRate: round(learningRate, 6),
      curve,
      trace,
    },
  };
}

/**
 * Byzantine BFT Quorum Verifier: N >= 3f + 1, Q = 2f + 1, f_max = floor((N - 1) / 3).
 */
export function solveBftQuorum(params = {}) {
  const nodes = Math.round(finiteNum(params.nodes, 7, 1, 1000));
  const faulty = Math.round(finiteNum(params.faulty, 2, 0, 333));
  const maxTolerableFaults = Math.floor((nodes - 1) / 3);
  const minNodesRequired = 3 * faulty + 1;
  const quorum = 2 * faulty + 1;
  const honestNodes = Math.max(0, nodes - faulty);
  const safetyHolds = nodes >= minNodesRequired;
  const livenessHolds = honestNodes >= quorum;
  const safetyMargin = nodes - minNodesRequired;
  const livenessMargin = honestNodes - quorum;
  const quorumFractionPct = nodes > 0 ? (quorum / nodes) * 100 : 0;

  const scalingTable = [0, 1, 2, 3, 4, 5, 6].map((f) => ({
    f,
    minN: 3 * f + 1,
    quorum: 2 * f + 1,
  }));

  const series = scalingTable.map((row) => ({
    x: row.f,
    label: `f=${row.f}`,
    y: row.minN,
  }));

  const metrics = [
    { label: 'Validator Count (N) & Faults (f)', value: `N = ${nodes}, f = ${faulty}` },
    { label: 'Minimum Safe Fleet (3f + 1)', value: `${minNodesRequired} nodes (margin ${safetyMargin >= 0 ? '+' : ''}${safetyMargin})` },
    { label: 'Quorum Threshold (Q = 2f + 1)', value: `${quorum} votes (${round(quorumFractionPct, 1)}% of N)` },
    { label: 'Max Tolerable Faults f_max', value: `⌊(N − 1) / 3⌋ = ${maxTolerableFaults}` },
    { label: 'Honest Liveness Margin', value: `${honestNodes} honest vs Q=${quorum} (${livenessMargin >= 0 ? '+' : ''}${livenessMargin})` },
    { label: 'BFT Safety & Liveness Verdict', value: safetyHolds && livenessHolds ? 'SAFE & LIVE (VALID QUORUM)' : 'UNSAFE (N < 3f + 1)' },
  ];

  const steps = [
    `1. Fleet parameters: N = ${nodes} validators, f = ${faulty} Byzantine faults assumed.`,
    `2. Safety invariant N ≥ 3f + 1: ${nodes} ${safetyHolds ? '≥' : '<'} ${minNodesRequired} ⇒ ${safetyHolds ? 'SATISFIED' : 'VIOLATED'} (margin = ${safetyMargin}).`,
    `3. Quorum size Q = 2f + 1 = ${quorum} votes guarantees any two quorums intersect in at least 2Q − N ≥ f + 1 honest/non-faulty witness(es) when N = 3f + 1.`,
    `4. Maximum faults tolerated by N = ${nodes} nodes: f_max = ⌊(${nodes} − 1)/3⌋ = ${maxTolerableFaults}.`,
    `5. Liveness check: N − f = ${honestNodes} honest nodes ${livenessHolds ? '≥' : '<'} Q = ${quorum} (liveness margin = ${livenessMargin}).`,
  ];

  return {
    pillarId: 'bft',
    title: 'Byzantine BFT Quorum',
    formula: 'N ≥ 3f + 1  |  Q = 2f + 1  |  f_max = ⌊(N − 1) / 3⌋',
    summary: `N=${nodes}, f=${faulty} → Q=${quorum}, f_max=${maxTolerableFaults}, verdict: ${safetyHolds && livenessHolds ? 'SAFE & LIVE' : 'UNSAFE'}.`,
    metrics,
    steps,
    chart: { xLabel: 'Byzantine Faults (f)', yLabel: 'Minimum Validators (3f + 1)', points: series },
    data: {
      nodes,
      faulty,
      minNodesRequired,
      quorum,
      maxTolerableFaults,
      honestNodes,
      safetyHolds,
      livenessHolds,
      safetyMargin,
      livenessMargin,
      quorumFractionPct: round(quorumFractionPct, 4),
      scalingTable,
    },
  };
}

/**
 * Unified deterministic evaluator with FIPS 180-4 SHA-256 verification receipt.
 */
export function evaluatePillar(pillarId, params = {}) {
  const id = String(pillarId || '').trim().toLowerCase();
  if (!PILLAR_IDS.includes(id)) {
    return {
      ok: false,
      error: `Unknown pillar "${id}". Valid pillars: ${PILLAR_IDS.join(', ')}.`,
      validPillars: [...PILLAR_IDS],
    };
  }

  let result;
  switch (id) {
    case 'linear':
      result = solveLinearAlgebra(params);
      break;
    case 'calculus':
      result = solveMultivariableCalculus(params);
      break;
    case 'probability':
      result = solveProbabilityInfo(params);
      break;
    case 'hessian':
      result = solveHessianManifolds(params);
      break;
    case 'lyapunov':
      result = solveLyapunovDynamics(params);
      break;
    case 'stdp':
      result = solveStdpPlasticity(params);
      break;
    case 'bft':
      result = solveBftQuorum(params);
      break;
    default:
      return { ok: false, error: `Unsupported pillar "${id}".` };
  }

  const catalogEntry = PILLAR_CATALOG.find((c) => c.id === id);
  const canonicalPayload = JSON.stringify({
    version: MATH_PILLARS_ENGINE_VERSION,
    pillarId: id,
    data: result.data,
  });
  const receiptSha256 = sha256Hex(canonicalPayload);

  return {
    ok: true,
    schemaVersion: MATH_PILLARS_ENGINE_VERSION,
    numeral: catalogEntry?.numeral || 'I',
    latex: catalogEntry?.latex || '',
    docsRoute: catalogEntry?.docsRoute || `/docs/math/${id}`,
    ...result,
    receiptSha256,
  };
}

/**
 * Exporters — JSON, Markdown proof report, formula-safe CSV table, and LaTeX snippet.
 */
export function exportEvaluationJson(evalResult) {
  return redactHomePaths(JSON.stringify(evalResult, null, 2));
}

export function exportEvaluationMarkdown(evalResult) {
  if (!evalResult || !evalResult.ok) {
    return `# Mathematical Evaluation Error\n\n${redactHomePaths(evalResult?.error || 'Invalid evaluation.')}\n`;
  }
  const lines = [
    `# Pillar ${evalResult.numeral}: ${evalResult.title} — Proof Report`,
    '',
    `- **Engine Version:** \`v${evalResult.schemaVersion || MATH_PILLARS_ENGINE_VERSION}\``,
    `- **Formula:** \`${evalResult.formula}\``,
    `- **Summary:** ${evalResult.summary}`,
    `- **SHA-256 Receipt:** \`${evalResult.receiptSha256}\``,
    '',
    '## Computed Metrics',
    '',
    '| Metric | Value |',
    '| :--- | :--- |',
    ...(evalResult.metrics || []).map((m) => `| ${String(m.label).replace(/\|/g, '\\|')} | \`${String(m.value).replace(/\|/g, '\\|')}\` |`),
    '',
    '## Step-by-Step Derivation',
    '',
    ...(evalResult.steps || []).map((s) => `- ${s}`),
    '',
    '---',
    '_Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform (https://nullai.tech)_',
    '',
  ];
  return redactHomePaths(lines.join('\n'));
}

export function exportEvaluationCsv(evalResult) {
  if (!evalResult || !evalResult.ok) {
    return 'pillar,metric,value\n"error","message",' + sanitizeCsvCell(evalResult?.error || 'Invalid evaluation') + '\n';
  }
  const rows = [
    ['pillar', 'metric', 'value'].map(sanitizeCsvCell).join(','),
    ...(evalResult.metrics || []).map((m) =>
      [evalResult.pillarId, m.label, m.value].map(sanitizeCsvCell).join(','),
    ),
    [evalResult.pillarId, 'receipt_sha256', evalResult.receiptSha256].map(sanitizeCsvCell).join(','),
  ];
  return `${rows.join('\n')}\n`;
}

function escapeLatexText(str) {
  return redactHomePaths(String(str ?? ''))
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([#$%&_{}])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

export function exportEvaluationLatex(evalResult) {
  if (!evalResult || !evalResult.ok) {
    return `% Error: ${escapeLatexText(evalResult?.error || 'Invalid evaluation')}\n`;
  }
  const lines = [
    `% Zoth Studio v2 — Pillar ${evalResult.numeral}: ${escapeLatexText(evalResult.title)}`,
    `% SHA-256 Receipt: ${evalResult.receiptSha256}`,
    '\\begin{equation}',
    `  ${evalResult.latex || escapeLatexText(evalResult.formula)}`,
    '\\end{equation}',
    '\\begin{itemize}',
    ...(evalResult.metrics || []).map(
      (m) => `  \\item \\textbf{${escapeLatexText(m.label)}:} ${escapeLatexText(m.value)}`,
    ),
    '\\end{itemize}',
    '',
  ];
  return lines.join('\n');
}

export function getMathPillarsSummary() {
  return {
    ok: true,
    schemaVersion: MATH_PILLARS_ENGINE_VERSION,
    engine: 'mathPillarsEngine',
    pillarCount: PILLAR_CATALOG.length,
    sixPillarsCount: 6,
    includesBftQuorum: true,
    pillars: PILLAR_CATALOG,
    verification: {
      stdpZeroNeutral: computeStdpDeltaW(0).deltaW === 0,
      lyapunovClamped: solveLyapunovDynamics({ lambda: 10, timeSec: 50 }).data.wasClamped === true,
      bftSevenTwoSafe: solveBftQuorum({ nodes: 7, faulty: 2 }).data.safetyHolds === true,
    },
  };
}
