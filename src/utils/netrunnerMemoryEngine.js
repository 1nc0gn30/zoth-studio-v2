/**
 * Lucy Netrunner Memory Hub — Pure Deterministic STDP, Hybrid Recall & Graph Engine (v2.4.0)
 *
 * Mirrored byte-identically at:
 *   - src/utils/netrunnerMemoryEngine.js
 *   - server/netrunner-memory-engine.mjs
 *
 * Invariants:
 *   - Zero external dependencies
 *   - Zero dynamic code evaluation or non-deterministic RNG calls
 *   - Zero literal host home paths
 *   - Strictly read-only normalization of 127.0.0.1:8094 snapshots
 *   - Exact Asymmetric Hebbian STDP with Δw(0) === 0
 *   - Real BM25 (TF saturation + IDF) + hashed n-gram cosine + Ebbinghaus salience recall
 *   - Multi-hop CA3/CA1 synaptic neighborhood propagation
 *   - Formula-safe CSV export + synchronous FIPS 180-4 SHA-256 verification receipts
 */

export const NETRUNNER_MEMORY_SCHEMA_VERSION = '2.4.0';
export const NETRUNNER_MEMORY_DAEMON_PORT = 8094;

export const DEFAULT_STDP_PARAMS = Object.freeze({
  aPlus: 0.85,
  aMinus: 0.45,
  tauPlusMs: 16.8,
  tauMinusMs: 33.7,
  wMin: 0.0,
  wMax: 1.0,
  initialWeight: 0.5,
});

export const NEUROMODULATOR_PROFILES = Object.freeze([
  Object.freeze({
    id: 'balanced',
    label: 'Balanced Baseline',
    shortLabel: 'Balanced',
    ltpGain: 1.0,
    ltdGain: 1.0,
    decayMultiplier: 1.0,
    explorationBias: 0.15,
    summary: 'Nominal cortical homeostatic balance across causal LTP, anti-causal LTD, and Ebbinghaus decay.',
  }),
  Object.freeze({
    id: 'dopamine',
    label: 'Dopamine (Reward LTP)',
    shortLabel: 'Dopamine',
    ltpGain: 1.45,
    ltdGain: 0.72,
    decayMultiplier: 0.82,
    explorationBias: 0.1,
    summary: 'Amplifies positive causal reinforcement (+45% LTP) and slows decay for verified task rewards.',
  }),
  Object.freeze({
    id: 'norepinephrine',
    label: 'Norepinephrine (Alertness)',
    shortLabel: 'Norepinephrine',
    ltpGain: 1.25,
    ltdGain: 1.15,
    decayMultiplier: 0.9,
    explorationBias: 0.05,
    summary: 'Sharpens signal-to-noise contrast by raising both causal potentiation and anti-causal pruning.',
  }),
  Object.freeze({
    id: 'acetylcholine',
    label: 'Acetylcholine (Encoding Focus)',
    shortLabel: 'Acetylcholine',
    ltpGain: 1.35,
    ltdGain: 0.95,
    decayMultiplier: 0.75,
    explorationBias: 0.08,
    summary: 'Prioritizes fresh episodic encoding and prolongs stability half-life during focused investigation.',
  }),
  Object.freeze({
    id: 'serotonin',
    label: 'Serotonin (Consolidation Calm)',
    shortLabel: 'Serotonin',
    ltpGain: 0.92,
    ltdGain: 0.8,
    decayMultiplier: 0.65,
    explorationBias: 0.25,
    summary: 'Dampens volatile weight swings and extends long-horizon associative consolidation across clusters.',
  }),
]);

export const NEUROMODULATOR_BY_ID = Object.freeze(
  Object.fromEntries(NEUROMODULATOR_PROFILES.map((p) => [p.id, p])),
);

export const DEFAULT_RECALL_WEIGHTS = Object.freeze({
  bm25: 0.4,
  cosine: 0.35,
  salience: 0.25,
});

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

function utf8Bytes(str) {
  const s = String(str ?? '');
  const out = [];
  for (let i = 0; i < s.length; i += 1) {
    let code = s.charCodeAt(i);
    if (code < 0x80) {
      out.push(code);
    } else if (code < 0x800) {
      out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code >= 0xd800 && code <= 0xdbff && i + 1 < s.length) {
      const next = s.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = ((code - 0xd800) << 10) + (next - 0xdc00) + 0x10000;
        i += 1;
        out.push(
          0xf0 | (code >> 18),
          0x80 | ((code >> 12) & 0x3f),
          0x80 | ((code >> 6) & 0x3f),
          0x80 | (code & 0x3f),
        );
      } else {
        out.push(0xef, 0xbf, 0xbd);
      }
    } else {
      out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  return new Uint8Array(out);
}

/**
 * Pure synchronous FIPS 180-4 SHA-256 implementation (browser + Node identical).
 */
export function sha256Hex(input) {
  const msg = utf8Bytes(input);
  const bitLen = msg.length * 8;
  const paddedLen = Math.ceil((msg.length + 9) / 64) * 64;
  const buf = new Uint8Array(paddedLen);
  buf.set(msg);
  buf[msg.length] = 0x80;
  const view = new DataView(buf.buffer);
  const high = Math.floor(bitLen / 0x100000000);
  const low = bitLen >>> 0;
  view.setUint32(paddedLen - 8, high, false);
  view.setUint32(paddedLen - 4, low, false);

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
    for (let i = 0; i < 16; i += 1) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i += 1) {
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

    for (let i = 0; i < 64; i += 1) {
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

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((v) => v.toString(16).padStart(8, '0'))
    .join('');
}

function roundTo(value, digits = 4) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function fnv1a32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Redacts literal host home directories and common secret shapes from any string.
 */
export function redactMemoryText(raw) {
  let s = String(raw ?? '');
  s = s.replace(/\/home\/[A-Za-z0-9._-]+(?=\/|["'\s,:;)\]]|$)/g, '~');
  s = s.replace(/\/Users\/[A-Za-z0-9._-]+(?=\/|["'\s,:;)\]]|$)/g, '~');
  s = s.replace(/C:\\Users\\[A-Za-z0-9._-]+/g, '~');
  s = s.replace(/-----BEGIN [A-Z0-9 ]+PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9 ]+PRIVATE KEY-----/g, '[REDACTED_PRIVATE_KEY]');
  s = s.replace(/\b(sk-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9]{16,}|xai-[A-Za-z0-9_-]{16,}|AIza[0-9A-Za-z_-]{20,})\b/g, '[REDACTED_TOKEN]');
  s = s.replace(/(Bearer\s+)[A-Za-z0-9._-]{16,}/gi, '$1[REDACTED_TOKEN]');
  return s;
}

export function redactMemoryPayload(value) {
  if (typeof value === 'string') return redactMemoryText(value);
  if (Array.isArray(value)) return value.map((item) => redactMemoryPayload(item));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = redactMemoryPayload(v);
    }
    return out;
  }
  return value;
}

export function resolveNeuromodulatorProfile(id = 'balanced') {
  const key = String(id || 'balanced').trim().toLowerCase();
  return NEUROMODULATOR_BY_ID[key] || NEUROMODULATOR_BY_ID.balanced;
}

/**
 * Exact Asymmetric Hebbian STDP Law:
 *   Δw(Δt) =  (A+ * ltpGain) * exp(-Δt / τ+)  for Δt > 0  (Causal LTP)
 *   Δw(Δt) = -(A- * ltdGain) * exp( Δt / τ-)  for Δt < 0  (Anti-causal LTD)
 *   Δw(0)  =  0                               for Δt === 0 (Neutral latency)
 */
export function computeStdpDelta(deltaTMs, options = {}) {
  const dt = Number(deltaTMs);
  if (!Number.isFinite(dt)) {
    return { ok: false, error: 'deltaTMs must be a finite number.' };
  }
  const aPlus = Number(options.aPlus ?? DEFAULT_STDP_PARAMS.aPlus);
  const aMinus = Number(options.aMinus ?? DEFAULT_STDP_PARAMS.aMinus);
  const tauPlusMs = Number(options.tauPlusMs ?? DEFAULT_STDP_PARAMS.tauPlusMs);
  const tauMinusMs = Number(options.tauMinusMs ?? DEFAULT_STDP_PARAMS.tauMinusMs);
  const wMin = Number(options.wMin ?? DEFAULT_STDP_PARAMS.wMin);
  const wMax = Number(options.wMax ?? DEFAULT_STDP_PARAMS.wMax);
  const initialWeight = Number(options.initialWeight ?? DEFAULT_STDP_PARAMS.initialWeight);

  if (
    !Number.isFinite(aPlus) || aPlus <= 0 || aPlus > 5 ||
    !Number.isFinite(aMinus) || aMinus <= 0 || aMinus > 5 ||
    !Number.isFinite(tauPlusMs) || tauPlusMs <= 0 || tauPlusMs > 500 ||
    !Number.isFinite(tauMinusMs) || tauMinusMs <= 0 || tauMinusMs > 500 ||
    !Number.isFinite(initialWeight)
  ) {
    return { ok: false, error: 'STDP parameters must be finite positive bounds (tau <= 500ms, A <= 5).' };
  }

  const profile = resolveNeuromodulatorProfile(options.neuromodulator);
  const clampedDt = clamp(dt, -200, 200);
  let deltaW = 0;
  let regime = 'NEUTRAL';

  if (clampedDt > 0) {
    deltaW = aPlus * profile.ltpGain * Math.exp(-clampedDt / tauPlusMs);
    regime = 'LTP';
  } else if (clampedDt < 0) {
    deltaW = -(aMinus * profile.ltdGain * Math.exp(clampedDt / tauMinusMs));
    regime = 'LTD';
  } else {
    deltaW = 0;
    regime = 'NEUTRAL';
  }

  const nextWeight = clamp(initialWeight + deltaW, wMin, wMax);
  const formula =
    regime === 'LTP'
      ? `Δw(+${roundTo(clampedDt, 2)}ms) = (${roundTo(aPlus * profile.ltpGain, 3)}) · exp(-${roundTo(clampedDt, 2)} / ${roundTo(tauPlusMs, 2)}) = +${roundTo(deltaW, 6)}`
      : regime === 'LTD'
      ? `Δw(${roundTo(clampedDt, 2)}ms) = -(${roundTo(aMinus * profile.ltdGain, 3)}) · exp(${roundTo(clampedDt, 2)} / ${roundTo(tauMinusMs, 2)}) = ${roundTo(deltaW, 6)}`
      : 'Δw(0ms) = 0 (strict neutral latency boundary)';

  return {
    ok: true,
    deltaTMs: roundTo(clampedDt, 2),
    deltaW: roundTo(deltaW, 6),
    regime,
    initialWeight: roundTo(clamp(initialWeight, wMin, wMax), 4),
    nextWeight: roundTo(nextWeight, 4),
    neuromodulator: profile.id,
    neuromodulatorLabel: profile.label,
    effectiveAPlus: roundTo(aPlus * profile.ltpGain, 4),
    effectiveAMinus: roundTo(aMinus * profile.ltdGain, 4),
    tauPlusMs: roundTo(tauPlusMs, 2),
    tauMinusMs: roundTo(tauMinusMs, 2),
    formula,
  };
}

/**
 * Samples the asymmetric STDP curve across [-100ms, +100ms], explicitly guaranteeing Δt = 0ms.
 */
export function sampleStdpCurve(options = {}) {
  const stepMs = clamp(Number(options.stepMs ?? 5) || 5, 2, 25);
  const points = [];
  for (let dt = -100; dt <= 100; dt += stepMs) {
    const res = computeStdpDelta(dt, options);
    points.push({
      deltaTMs: dt,
      deltaW: res.ok ? res.deltaW : 0,
      regime: res.ok ? res.regime : 'NEUTRAL',
    });
  }
  if (!points.some((p) => p.deltaTMs === 0)) {
    points.push({ deltaTMs: 0, deltaW: 0, regime: 'NEUTRAL' });
    points.sort((a, b) => a.deltaTMs - b.deltaTMs);
  }
  return points;
}

/**
 * Ebbinghaus Retention Law: R(t, S) = exp(-t / S_eff)
 * Modulated by neuromodulator decayMultiplier and logarithmic access-count spacing boost.
 */
export function computeEbbinghausRetention({
  ageHours = 24,
  stabilityHours = 72,
  accessCount = 1,
  neuromodulator = 'balanced',
} = {}) {
  const t = Number(ageHours);
  const s = Number(stabilityHours);
  const accesses = Number(accessCount);
  if (!Number.isFinite(t) || t < 0 || !Number.isFinite(s) || s <= 0 || !Number.isFinite(accesses) || accesses < 0) {
    return { ok: false, error: 'ageHours >= 0, stabilityHours > 0, and accessCount >= 0 must be finite numbers.' };
  }
  const profile = resolveNeuromodulatorProfile(neuromodulator);
  const spacingGain = 1 + Math.log2(1 + accesses) * 0.35;
  const effectiveStabilityHours = Math.max(1, (s * spacingGain) / profile.decayMultiplier);
  const retention = clamp(Math.exp(-t / effectiveStabilityHours), 0, 1);
  const halfLifeHours = effectiveStabilityHours * Math.LN2;
  return {
    ok: true,
    ageHours: roundTo(t, 2),
    baseStabilityHours: roundTo(s, 2),
    effectiveStabilityHours: roundTo(effectiveStabilityHours, 2),
    halfLifeHours: roundTo(halfLifeHours, 2),
    retention: roundTo(retention, 6),
    retentionPct: roundTo(retention * 100, 2),
    neuromodulator: profile.id,
    formula: `R(${roundTo(t, 1)}h, S=${roundTo(effectiveStabilityHours, 1)}h) = exp(-${roundTo(t, 1)} / ${roundTo(effectiveStabilityHours, 1)}) = ${roundTo(retention, 4)}`,
  };
}

export function sampleRetentionCurve(options = {}) {
  const maxHours = clamp(Number(options.maxHours ?? 168) || 168, 24, 720);
  const steps = 24;
  const pts = [];
  for (let i = 0; i <= steps; i += 1) {
    const ageHours = roundTo((maxHours * i) / steps, 1);
    const res = computeEbbinghausRetention({ ...options, ageHours });
    pts.push({
      ageHours,
      retention: res.ok ? res.retention : 0,
      retentionPct: res.ok ? res.retentionPct : 0,
    });
  }
  return pts;
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'over', 'are', 'was', 'were', 'has', 'have',
  'not', 'but', 'all', 'any', 'can', 'via', 'its', 'our', 'your', 'you', 'use', 'using',
]);

export function tokenizeText(text) {
  const norm = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9_.:/-]+/g, ' ')
    .trim();
  if (!norm) return [];
  return norm
    .split(/\s+/)
    .flatMap((tok) => tok.split(/[:/._-]+/))
    .filter((tok) => tok.length >= 2 && !STOPWORDS.has(tok));
}

const HASH_DIM = 96;

/**
 * Deterministic signed feature hashing over token unigrams + character trigrams.
 * Produces an L2-normalized dense vector in R^96 with zero randomness or external models.
 */
export function buildHashedNgramVector(text) {
  const vec = new Float64Array(HASH_DIM);
  const tokens = tokenizeText(text);
  for (const tok of tokens) {
    const h = fnv1a32(`t:${tok}`);
    const idx = h % HASH_DIM;
    const sign = (h & 1) === 0 ? 1 : -1;
    vec[idx] += sign * 1.4;
    if (tok.length >= 3) {
      for (let i = 0; i <= tok.length - 3; i += 1) {
        const tri = tok.slice(i, i + 3);
        const th = fnv1a32(`c:${tri}`);
        const tidx = th % HASH_DIM;
        const tsign = (th & 1) === 0 ? 1 : -1;
        vec[tidx] += tsign * 0.65;
      }
    }
  }
  let normSq = 0;
  for (let i = 0; i < HASH_DIM; i += 1) normSq += vec[i] * vec[i];
  const norm = Math.sqrt(normSq);
  if (norm > 0) {
    for (let i = 0; i < HASH_DIM; i += 1) vec[i] /= norm;
  }
  return vec;
}

export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  for (let i = 0; i < vecA.length; i += 1) {
    dot += vecA[i] * vecB[i];
  }
  // Map signed hashed cosine [-1, 1] cleanly to non-negative semantic overlap [0, 1]
  return roundTo(clamp(dot, 0, 1), 4);
}

/**
 * Genuine Hybrid Recall Engine:
 *   - BM25 (Robertson-Sparck Jones IDF + TF saturation k1=1.5 + length norm b=0.75)
 *   - Deterministic hashed token + char-trigram cosine similarity
 *   - Temporal Ebbinghaus retention × engram importance salience
 */
export function runHybridRecall(engrams, {
  query = '',
  weights = DEFAULT_RECALL_WEIGHTS,
  neuromodulator = 'balanced',
  stabilityHours = 72,
  limit = 12,
  k1 = 1.5,
  b = 0.75,
} = {}) {
  const list = Array.isArray(engrams) ? engrams : [];
  const rawW = {
    bm25: Math.max(0, Number(weights?.bm25 ?? DEFAULT_RECALL_WEIGHTS.bm25) || 0),
    cosine: Math.max(0, Number(weights?.cosine ?? DEFAULT_RECALL_WEIGHTS.cosine) || 0),
    salience: Math.max(0, Number(weights?.salience ?? DEFAULT_RECALL_WEIGHTS.salience) || 0),
  };
  const wSum = rawW.bm25 + rawW.cosine + rawW.salience;
  const normW = wSum > 0
    ? { bm25: rawW.bm25 / wSum, cosine: rawW.cosine / wSum, salience: rawW.salience / wSum }
    : { ...DEFAULT_RECALL_WEIGHTS };

  const queryStr = String(query || '').trim();
  const queryTokens = tokenizeText(queryStr);
  const uniqueQueryTokens = [...new Set(queryTokens)];
  const queryVec = queryStr ? buildHashedNgramVector(queryStr) : null;

  const docs = list.map((item) => {
    const corpusText = `${item.text || ''} ${(item.tags || []).join(' ')} ${item.category || ''}`;
    const tokens = tokenizeText(corpusText);
    const tfMap = new Map();
    for (const tok of tokens) {
      tfMap.set(tok, (tfMap.get(tok) || 0) + 1);
    }
    return { item, corpusText, tokens, tfMap, len: Math.max(1, tokens.length) };
  });

  const N = Math.max(1, docs.length);
  const avgdl = docs.reduce((acc, d) => acc + d.len, 0) / N;

  const dfMap = new Map();
  for (const tok of uniqueQueryTokens) {
    let df = 0;
    for (const d of docs) {
      if (d.tfMap.has(tok)) df += 1;
    }
    dfMap.set(tok, df);
  }

  let maxRawBm25 = 0;
  const prelim = docs.map((d) => {
    let rawBm25 = 0;
    const matchedTerms = [];
    for (const tok of uniqueQueryTokens) {
      const tf = d.tfMap.get(tok) || 0;
      if (tf > 0) {
        matchedTerms.push(tok);
        const df = dfMap.get(tok) || 0;
        const idf = Math.log(((N - df + 0.5) / (df + 0.5)) + 1);
        const denom = tf + k1 * (1 - b + b * (d.len / avgdl));
        rawBm25 += idf * ((tf * (k1 + 1)) / denom);
      }
    }
    if (rawBm25 > maxRawBm25) maxRawBm25 = rawBm25;

    const cosine = queryVec ? cosineSimilarity(queryVec, buildHashedNgramVector(d.corpusText)) : 0;
    const ret = computeEbbinghausRetention({
      ageHours: Number(d.item.ageHours ?? 12),
      stabilityHours,
      accessCount: Number(d.item.accessCount ?? 1),
      neuromodulator,
    });
    const retention = ret.ok ? ret.retention : 0.5;
    const importance = clamp(Number(d.item.importance ?? 0.5), 0, 1);
    const salienceScore = clamp(importance * 0.55 + retention * 0.45, 0, 1);

    return {
      item: d.item,
      rawBm25,
      matchedTerms,
      cosine,
      retention,
      importance,
      salienceScore,
    };
  });

  const ranked = prelim
    .map((entry) => {
      const bm25Norm = maxRawBm25 > 0 ? clamp(entry.rawBm25 / maxRawBm25, 0, 1) : 0;
      const composite = queryStr
        ? normW.bm25 * bm25Norm + normW.cosine * entry.cosine + normW.salience * entry.salienceScore
        : entry.salienceScore;
      return {
        id: entry.item.id,
        shortId: entry.item.shortId || String(entry.item.id || '').slice(0, 8),
        category: entry.item.category || 'episodic',
        text: entry.item.text || '',
        tags: Array.isArray(entry.item.tags) ? entry.item.tags : [],
        importance: roundTo(entry.importance, 3),
        accessCount: Number(entry.item.accessCount ?? 1),
        ageHours: roundTo(Number(entry.item.ageHours ?? 12), 1),
        synapseCount: Number(entry.item.synapseCount ?? 0),
        bm25Raw: roundTo(entry.rawBm25, 4),
        bm25Score: roundTo(bm25Norm, 4),
        cosineScore: roundTo(entry.cosine, 4),
        retentionScore: roundTo(entry.retention, 4),
        salienceScore: roundTo(entry.salienceScore, 4),
        compositeScore: roundTo(clamp(composite, 0, 1), 4),
        matchedTerms: entry.matchedTerms,
      };
    })
    .sort((a, b) => (b.compositeScore - a.compositeScore) || a.id.localeCompare(b.id));

  const boundedLimit = clamp(Number(limit) || 12, 1, 50);
  return {
    query: queryStr,
    queryTokens: uniqueQueryTokens,
    weights: {
      bm25: roundTo(normW.bm25, 3),
      cosine: roundTo(normW.cosine, 3),
      salience: roundTo(normW.salience, 3),
    },
    corpusSize: docs.length,
    avgDocLength: roundTo(avgdl, 2),
    results: ranked.slice(0, boundedLimit),
  };
}

/**
 * Computes multi-hop CA3/CA1 associative trace & neighborhood around a seed node.
 */
export function computeAssociativeTrace(graph, {
  seedNodeId = '',
  maxHops = 2,
  damping = 0.72,
  minWeight = 0.1,
} = {}) {
  const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph?.edges) ? graph.edges : [];
  if (nodes.length === 0) {
    return { seedId: null, hops: [], activeEdges: [], totalActivated: 0, ca3Coherence: 0 };
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const adj = new Map();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) {
    const w = clamp(Number(e.weight ?? 0.5), 0, 1);
    if (w < minWeight) continue;
    if (adj.has(e.source) && adj.has(e.target)) {
      adj.get(e.source).push({ target: e.target, weight: w });
      adj.get(e.target).push({ target: e.source, weight: w });
    }
  }

  const resolvedSeed = nodeMap.has(seedNodeId)
    ? seedNodeId
    : [...nodes].sort((a, b) => (b.degree - a.degree) || (b.importance - a.importance))[0].id;

  const hopsLimit = clamp(Number(maxHops) || 2, 1, 3);
  const activation = new Map([[resolvedSeed, 1.0]]);
  const depthMap = new Map([[resolvedSeed, 0]]);
  const activeEdges = [];
  const seenEdgeKeys = new Set();

  let frontier = [resolvedSeed];
  for (let hop = 1; hop <= hopsLimit; hop += 1) {
    const nextFrontier = [];
    for (const u of frontier) {
      const uAct = activation.get(u) || 0;
      const neighbors = (adj.get(u) || []).slice().sort((a, b) => b.weight - a.weight);
      for (const nb of neighbors) {
        const contrib = uAct * nb.weight * (damping ** hop);
        const prev = activation.get(nb.target) || 0;
        if (contrib > prev) {
          activation.set(nb.target, clamp(contrib, 0, 1));
        }
        if (!depthMap.has(nb.target)) {
          depthMap.set(nb.target, hop);
          nextFrontier.push(nb.target);
        }
        const ek = u < nb.target ? `${u}|${nb.target}` : `${nb.target}|${u}`;
        if (!seenEdgeKeys.has(ek)) {
          seenEdgeKeys.add(ek);
          activeEdges.push({ source: u, target: nb.target, weight: roundTo(nb.weight, 3), hop });
        }
      }
    }
    frontier = nextFrontier;
  }

  const activatedNodes = [...activation.entries()]
    .map(([id, act]) => {
      const node = nodeMap.get(id);
      return {
        id,
        shortId: node?.shortId || id.slice(0, 8),
        label: node?.label || id,
        category: node?.category || 'episodic',
        hop: depthMap.get(id) ?? 0,
        activation: roundTo(act, 4),
        importance: roundTo(node?.importance ?? 0.5, 3),
        degree: node?.degree ?? 0,
      };
    })
    .sort((a, b) => (a.hop - b.hop) || (b.activation - a.activation) || a.id.localeCompare(b.id));

  const nonSeed = activatedNodes.filter((n) => n.hop > 0);
  const ca3Coherence = nonSeed.length > 0
    ? roundTo(nonSeed.reduce((acc, n) => acc + n.activation, 0) / nonSeed.length, 4)
    : 0;

  return {
    seedId: resolvedSeed,
    seedLabel: nodeMap.get(resolvedSeed)?.label || resolvedSeed,
    maxHops: hopsLimit,
    totalActivated: activatedNodes.length,
    ca3Coherence,
    nodes: activatedNodes.slice(0, 20),
    activeEdges: activeEdges.slice(0, 40),
  };
}

const CATEGORY_ANGLES = Object.freeze({
  episodic: 0.15,
  security_chain: 1.05,
  network_egress: 1.95,
  insight: 2.85,
  semantic: 3.75,
  procedural: 4.65,
  architecture: 5.4,
  live_voice_dialogue: 0.6,
  achievement: 2.4,
  engineering_sprint: 4.2,
});

/**
 * Deterministic 2D cortex layout in [0..640] x [0..340] — zero non-deterministic RNG.
 */
export function buildDeterministicGraphLayout(rawNodes, rawEdges) {
  const nodes = (Array.isArray(rawNodes) ? rawNodes : []).slice(0, 48).map((n, idx) => {
    const id = String(n?.id || `node-${idx + 1}`);
    const category = String(n?.category || 'episodic');
    const importance = clamp(Number(n?.importance ?? 0.5), 0.05, 1.0);
    const label = redactMemoryText(String(n?.label || n?.text || id)).replace(/\s+/g, ' ').trim().slice(0, 88);
    return {
      id,
      shortId: id.slice(0, 8),
      label,
      category,
      importance: roundTo(importance, 3),
      accessCount: Math.max(0, Math.round(Number(n?.access_count ?? n?.accessCount ?? 1))),
      tags: Array.isArray(n?.tags) ? n.tags.slice(0, 6).map((t) => redactMemoryText(String(t))) : [],
      degree: 0,
      x: 320,
      y: 170,
    };
  });

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const edges = [];
  const seen = new Set();
  const srcEdges = Array.isArray(rawEdges) ? rawEdges : [];
  for (const e of srcEdges) {
    const s = String(e?.source || '');
    const t = String(e?.target || '');
    if (!s || !t || s === t || !nodeById.has(s) || !nodeById.has(t)) continue;
    const key = s < t ? `${s}|${t}` : `${t}|${s}`;
    if (seen.has(key)) continue;
    seen.add(key);
    edges.push({
      source: s,
      target: t,
      weight: roundTo(clamp(Number(e?.weight ?? 0.4), 0.05, 1.0), 3),
    });
    nodeById.get(s).degree += 1;
    nodeById.get(t).degree += 1;
    if (edges.length >= 120) break;
  }

  const cx = 320;
  const cy = 170;
  const goldenAngle = 2.399963229728653;
  nodes.forEach((n, idx) => {
    const h = fnv1a32(n.id);
    const baseAngle = CATEGORY_ANGLES[n.category] ?? ((h % 360) * (Math.PI / 180));
    const spread = ((h % 1000) / 1000 - 0.5) * 0.95 + (idx * goldenAngle * 0.11);
    const angle = baseAngle + spread;
    // Higher-importance / higher-degree hubs sit closer to the Oracle center
    const centrality = clamp(n.importance * 0.6 + Math.min(1, n.degree / 8) * 0.4, 0, 1);
    const rx = 250 - centrality * 145;
    const ry = 132 - centrality * 74;
    n.x = roundTo(clamp(cx + Math.cos(angle) * rx, 36, 604), 1);
    n.y = roundTo(clamp(cy + Math.sin(angle) * ry, 28, 312), 1);
  });

  return { nodes, edges };
}

/**
 * Curated deterministic fallback corpus used honestly when :3000 or :8094 is offline.
 */
export const OFFLINE_CURATED_ENGRAMS = Object.freeze([
  Object.freeze({
    id: 'engram-stdp-core-01',
    shortId: 'stdp-01',
    category: 'architecture',
    text: 'Asymmetric Hebbian STDP enforces Δw(Δt) = A+ exp(-Δt/τ+) for causal Δt > 0, -A- exp(Δt/τ-) for anti-causal Δt < 0, and strict neutral Δw(0) = 0.',
    tags: ['stdp', 'hebbian', 'ca3-ca1', 'plasticity'],
    importance: 0.95,
    accessCount: 14,
    ageHours: 2.5,
    synapseCount: 7,
  }),
  Object.freeze({
    id: 'engram-loopback-02',
    shortId: 'loop-02',
    category: 'security_chain',
    text: 'Studio API /api/studio/netrunner-memory enforces strict loopback Host and Origin 403 guards and performs exclusively read-only GET probes to 127.0.0.1:8094.',
    tags: ['loopback', 'readonly', 'host-403', 'security'],
    importance: 0.93,
    accessCount: 11,
    ageHours: 4.0,
    synapseCount: 6,
  }),
  Object.freeze({
    id: 'engram-sqlite-wal-03',
    shortId: 'wal-03',
    category: 'procedural',
    text: 'Neuro-Memory Daemon persists episodic engrams and weighted synaptic edges in local SQLite WAL storage under ~/.zoth/memory with zero cloud vector egress.',
    tags: ['sqlite', 'wal', 'local-first', 'zero-egress'],
    importance: 0.89,
    accessCount: 9,
    ageHours: 8.5,
    synapseCount: 6,
  }),
  Object.freeze({
    id: 'engram-hybrid-recall-04',
    shortId: 'rec-04',
    category: 'semantic',
    text: 'Hybrid recall blends Robertson-Sparck Jones BM25 lexical matching, deterministic hashed n-gram cosine similarity, and Ebbinghaus temporal salience R(t,S)=exp(-t/S).',
    tags: ['bm25', 'cosine', 'ebbinghaus', 'hybrid-recall'],
    importance: 0.91,
    accessCount: 12,
    ageHours: 6.0,
    synapseCount: 7,
  }),
  Object.freeze({
    id: 'engram-egress-guard-05',
    shortId: 'egr-05',
    category: 'network_egress',
    text: 'Zero-egress workstation verification blocks external font CDNs and remote telemetry so every browser asset resolves from local Studio origin.',
    tags: ['zero-egress', 'csp', 'audit', 'fonts'],
    importance: 0.86,
    accessCount: 7,
    ageHours: 14.0,
    synapseCount: 5,
  }),
  Object.freeze({
    id: 'engram-ca3-hop-06',
    shortId: 'ca3-06',
    category: 'insight',
    text: 'Hippocampal CA3 recurrent pattern completion propagates activation across 2-hop weighted synapses to surface linked debugging context before CA1 readout.',
    tags: ['ca3', 'ca1', 'associative', 'graph'],
    importance: 0.84,
    accessCount: 8,
    ageHours: 18.0,
    synapseCount: 6,
  }),
  Object.freeze({
    id: 'engram-cli-serve-07',
    shortId: 'cli-07',
    category: 'procedural',
    text: 'Start the standing loopback daemon via python3 -m neuro_memory_daemon.cli serve --port 8094 and inspect live counts on GET /api/stats.',
    tags: ['cli', 'daemon', '8094', 'stats'],
    importance: 0.88,
    accessCount: 10,
    ageHours: 11.0,
    synapseCount: 5,
  }),
  Object.freeze({
    id: 'engram-neuromod-08',
    shortId: 'mod-08',
    category: 'semantic',
    text: 'Dopamine boosts causal LTP gain (+45%) for verified engineering fixes while acetylcholine and serotonin extend stability half-life during consolidation.',
    tags: ['dopamine', 'acetylcholine', 'serotonin', 'neuromodulator'],
    importance: 0.82,
    accessCount: 6,
    ageHours: 26.0,
    synapseCount: 5,
  }),
  Object.freeze({
    id: 'engram-obsidian-09',
    shortId: 'obs-09',
    category: 'episodic',
    text: 'Obsidian Vault notes Workstation netrunner-memory.md and Legacy netrunner-memory.md stay bit-identical between host Vault and ZothOS live chroot skel.',
    tags: ['obsidian', 'vault', 'chroot', 'parity'],
    importance: 0.79,
    accessCount: 5,
    ageHours: 32.0,
    synapseCount: 4,
  }),
  Object.freeze({
    id: 'engram-wcag-theme-10',
    shortId: 'ui-10',
    category: 'architecture',
    text: 'Editorial Ivory Light Mode and Obsidian Gold Dark Mode maintain >= 4.5:1 WCAG AA text contrast and eliminate dark canvas slabs on light parchment surfaces.',
    tags: ['wcag', 'light-mode', 'dark-mode', 'mui'],
    importance: 0.85,
    accessCount: 7,
    ageHours: 16.0,
    synapseCount: 4,
  }),
  Object.freeze({
    id: 'engram-sha256-11',
    shortId: 'sha-11',
    category: 'security_chain',
    text: 'All JSON, Markdown, and formula-safe CSV exports carry synchronous FIPS 180-4 SHA-256 verification receipts with home paths redacted to ~/',
    tags: ['sha256', 'csv-safe', 'export', 'redaction'],
    importance: 0.83,
    accessCount: 6,
    ageHours: 22.0,
    synapseCount: 5,
  }),
  Object.freeze({
    id: 'engram-voice-log-12',
    shortId: 'voc-12',
    category: 'live_voice_dialogue',
    text: 'Local voice debrief session confirmed 127.0.0.1:8094 synaptic density stability and read-only telemetry bridge readiness across Zoth Studio.',
    tags: ['voice', 'telemetry', '8094', 'debrief'],
    importance: 0.74,
    accessCount: 3,
    ageHours: 48.0,
    synapseCount: 4,
  }),
]);

export const OFFLINE_CURATED_EDGES = Object.freeze([
  { source: 'engram-stdp-core-01', target: 'engram-hybrid-recall-04', weight: 0.94 },
  { source: 'engram-stdp-core-01', target: 'engram-ca3-hop-06', weight: 0.91 },
  { source: 'engram-stdp-core-01', target: 'engram-neuromod-08', weight: 0.88 },
  { source: 'engram-stdp-core-01', target: 'engram-sqlite-wal-03', weight: 0.79 },
  { source: 'engram-loopback-02', target: 'engram-egress-guard-05', weight: 0.92 },
  { source: 'engram-loopback-02', target: 'engram-cli-serve-07', weight: 0.87 },
  { source: 'engram-loopback-02', target: 'engram-sha256-11', weight: 0.84 },
  { source: 'engram-loopback-02', target: 'engram-sqlite-wal-03', weight: 0.81 },
  { source: 'engram-sqlite-wal-03', target: 'engram-cli-serve-07', weight: 0.86 },
  { source: 'engram-sqlite-wal-03', target: 'engram-obsidian-09', weight: 0.77 },
  { source: 'engram-hybrid-recall-04', target: 'engram-ca3-hop-06', weight: 0.9 },
  { source: 'engram-hybrid-recall-04', target: 'engram-neuromod-08', weight: 0.82 },
  { source: 'engram-hybrid-recall-04', target: 'engram-sha256-11', weight: 0.73 },
  { source: 'engram-egress-guard-05', target: 'engram-wcag-theme-10', weight: 0.85 },
  { source: 'engram-egress-guard-05', target: 'engram-sha256-11', weight: 0.78 },
  { source: 'engram-ca3-hop-06', target: 'engram-neuromod-08', weight: 0.83 },
  { source: 'engram-ca3-hop-06', target: 'engram-voice-log-12', weight: 0.68 },
  { source: 'engram-cli-serve-07', target: 'engram-voice-log-12', weight: 0.76 },
  { source: 'engram-obsidian-09', target: 'engram-wcag-theme-10', weight: 0.72 },
  { source: 'engram-obsidian-09', target: 'engram-sha256-11', weight: 0.75 },
  { source: 'engram-wcag-theme-10', target: 'engram-stdp-core-01', weight: 0.69 },
  { source: 'engram-voice-log-12', target: 'engram-loopback-02', weight: 0.74 },
]);

/**
 * Normalizes read-only :8094 responses (/health, /api/stats, /api/memories, /api/graph)
 * with strict ~/ path + secret redaction and deterministic graph coordinates.
 */
export function normalizeNetrunnerMemorySnapshot({
  mode = 'LIVE_LOOPBACK',
  checkedAt = new Date().toISOString(),
  health = null,
  stats = null,
  memories = null,
  graph = null,
  probes = {},
  offlineNotice = null,
} = {}) {
  const nowSec = Date.parse(checkedAt) ? Date.parse(checkedAt) / 1000 : 1795853181;
  const daemonOnline = Boolean(health?.status === 'ok' || probes?.health?.online);

  const rawMemList = Array.isArray(memories?.memories)
    ? memories.memories
    : Array.isArray(memories)
    ? memories
    : [];

  const normalizedEngrams = rawMemList.length > 0
    ? rawMemList.slice(0, 24).map((m, idx) => {
        const id = String(m?.id || `engram-${idx + 1}`);
        const createdAt = Number(m?.created_at ?? m?.createdAt ?? 0);
        const ageHours = createdAt > 0
          ? clamp((nowSec - createdAt) / 3600, 0.1, 720)
          : clamp(Number(m?.ageHours ?? (idx + 1) * 3.5), 0.1, 720);
        const synObj = m?.synapses && typeof m.synapses === 'object' ? m.synapses : null;
        const synapseCount = synObj
          ? Object.keys(synObj).length
          : Math.max(0, Math.round(Number(m?.synapseCount ?? 0)));
        return {
          id,
          shortId: id.slice(0, 8),
          category: redactMemoryText(String(m?.category || 'episodic')).slice(0, 48),
          text: redactMemoryText(String(m?.text || m?.content || '')).replace(/\s+/g, ' ').trim().slice(0, 420),
          tags: Array.isArray(m?.tags) ? m.tags.slice(0, 8).map((t) => redactMemoryText(String(t)).slice(0, 48)) : [],
          importance: roundTo(clamp(Number(m?.importance ?? m?.salience ?? 0.5), 0, 1), 3),
          accessCount: Math.max(0, Math.round(Number(m?.access_count ?? m?.accessCount ?? 1))),
          ageHours: roundTo(ageHours, 1),
          synapseCount,
        };
      })
    : OFFLINE_CURATED_ENGRAMS.map((e) => ({ ...e, tags: [...e.tags] }));

  const rawGraphNodes = Array.isArray(graph?.nodes) && graph.nodes.length > 0
    ? graph.nodes
    : normalizedEngrams.map((e) => ({
        id: e.id,
        label: e.text.slice(0, 72),
        category: e.category,
        importance: e.importance,
        tags: e.tags,
        access_count: e.accessCount,
      }));

  const rawGraphEdges = Array.isArray(graph?.edges) && graph.edges.length > 0
    ? graph.edges
    : Array.isArray(graph?.links) && graph.links.length > 0
    ? graph.links
    : rawMemList.length > 0
    ? []
    : OFFLINE_CURATED_EDGES;

  const layout = buildDeterministicGraphLayout(rawGraphNodes, rawGraphEdges);

  const rawCats = stats?.categories && typeof stats.categories === 'object' ? stats.categories : null;
  let categoriesList = [];
  if (rawCats) {
    categoriesList = Object.entries(rawCats)
      .map(([name, count]) => ({
        name: redactMemoryText(String(name)),
        count: Math.max(0, Math.round(Number(count) || 0)),
      }))
      .filter((c) => c.count > 0)
      .sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name));
  } else {
    const counts = new Map();
    for (const e of normalizedEngrams) {
      counts.set(e.category, (counts.get(e.category) || 0) + 1);
    }
    categoriesList = [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name));
  }

  const totalMemories = Number.isFinite(Number(stats?.total_memories))
    ? Math.max(0, Math.round(Number(stats.total_memories)))
    : normalizedEngrams.length;
  const totalSynapses = Number.isFinite(Number(stats?.total_synapses))
    ? Math.max(0, Math.round(Number(stats.total_synapses)))
    : layout.edges.length;
  const synapticDensity = Number.isFinite(Number(stats?.synaptic_density))
    ? roundTo(Number(stats.synaptic_density), 2)
    : totalMemories > 0
    ? roundTo(totalSynapses / totalMemories, 2)
    : 0;
  const averageImportance = Number.isFinite(Number(stats?.average_importance))
    ? roundTo(Number(stats.average_importance), 3)
    : roundTo(normalizedEngrams.reduce((acc, e) => acc + e.importance, 0) / Math.max(1, normalizedEngrams.length), 3);
  const averageAccesses = Number.isFinite(Number(stats?.average_accesses))
    ? roundTo(Number(stats.average_accesses), 2)
    : roundTo(normalizedEngrams.reduce((acc, e) => acc + e.accessCount, 0) / Math.max(1, normalizedEngrams.length), 2);

  const normalizedHealth = {
    online: daemonOnline,
    status: redactMemoryText(String(health?.status || (daemonOnline ? 'ok' : 'offline'))),
    service: redactMemoryText(String(health?.service || 'neuro-memory-daemon')),
    version: redactMemoryText(String(health?.version || (daemonOnline ? '0.1.0' : 'offline'))),
    port: NETRUNNER_MEMORY_DAEMON_PORT,
    readOnlyEnforced: true,
  };

  const summary = {
    totalMemories,
    totalSynapses,
    synapticDensity,
    workingMemoryUsage: Math.max(0, Math.round(Number(stats?.working_memory_usage ?? 0))),
    averageImportance,
    averageAccesses,
    categoryCount: categoriesList.length,
    sampledMemories: normalizedEngrams.length,
    graphNodes: layout.nodes.length,
    graphEdges: layout.edges.length,
    totalGraphNodes: Math.max(layout.nodes.length, Math.round(Number(graph?.total_nodes ?? layout.nodes.length))),
    totalGraphEdges: Math.max(layout.edges.length, Math.round(Number(graph?.total_edges ?? layout.edges.length))),
  };

  const payload = redactMemoryPayload({
    ok: true,
    schemaVersion: NETRUNNER_MEMORY_SCHEMA_VERSION,
    mode,
    readOnly: true,
    daemonPort: NETRUNNER_MEMORY_DAEMON_PORT,
    daemonOnline,
    checkedAt: String(checkedAt),
    offlineNotice: offlineNotice || null,
    health: normalizedHealth,
    summary,
    categories: categoriesList,
    engrams: normalizedEngrams,
    graph: layout,
    probes: {
      health: {
        online: Boolean(probes?.health?.online),
        httpStatus: Number(probes?.health?.httpStatus || 0),
        latencyMs: probes?.health?.latencyMs ?? null,
      },
      stats: {
        online: Boolean(probes?.stats?.online),
        httpStatus: Number(probes?.stats?.httpStatus || 0),
        latencyMs: probes?.stats?.latencyMs ?? null,
      },
      memories: {
        online: Boolean(probes?.memories?.online),
        httpStatus: Number(probes?.memories?.httpStatus || 0),
        latencyMs: probes?.memories?.latencyMs ?? null,
      },
      graph: {
        online: Boolean(probes?.graph?.online),
        httpStatus: Number(probes?.graph?.httpStatus || 0),
        latencyMs: probes?.graph?.latencyMs ?? null,
      },
    },
  });

  const receiptBody = JSON.stringify({
    schemaVersion: payload.schemaVersion,
    mode: payload.mode,
    readOnly: payload.readOnly,
    daemonOnline: payload.daemonOnline,
    summary: payload.summary,
    topEngramIds: payload.engrams.slice(0, 6).map((e) => e.id),
  });

  return {
    ...payload,
    receiptSha256: sha256Hex(receiptBody),
  };
}

export function buildOfflineNetrunnerMemorySnapshot() {
  return normalizeNetrunnerMemorySnapshot({
    mode: 'BROWSER_OFFLINE_FALLBACK',
    checkedAt: '2026-11-28T00:00:00.000Z',
    health: null,
    stats: null,
    memories: null,
    graph: null,
    probes: {},
    offlineNotice:
      'Browser Offline Fallback active: Studio loopback (:3000) or Neuro-Memory Daemon (:8094) is not connected. Displaying curated 12-engram / 22-synapse cortex corpus with full in-browser STDP, BM25 + cosine recall, CA3/CA1 graph trace, and SHA-256 exports.',
  });
}

/**
 * Deterministic evaluation entrypoint shared by browser & POST /api/studio/netrunner-memory/evaluate.
 */
export function evaluateNetrunnerMemory(input = {}, corpusSnapshot = null) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'Evaluation payload must be a JSON object.' };
  }

  const snap = corpusSnapshot && Array.isArray(corpusSnapshot.engrams)
    ? corpusSnapshot
    : buildOfflineNetrunnerMemorySnapshot();

  const stdp = computeStdpDelta(input.deltaTMs ?? 12, {
    aPlus: input.aPlus ?? DEFAULT_STDP_PARAMS.aPlus,
    aMinus: input.aMinus ?? DEFAULT_STDP_PARAMS.aMinus,
    tauPlusMs: input.tauPlusMs ?? DEFAULT_STDP_PARAMS.tauPlusMs,
    tauMinusMs: input.tauMinusMs ?? DEFAULT_STDP_PARAMS.tauMinusMs,
    initialWeight: input.initialWeight ?? DEFAULT_STDP_PARAMS.initialWeight,
    neuromodulator: input.neuromodulator ?? 'balanced',
  });
  if (!stdp.ok) return stdp;

  const retention = computeEbbinghausRetention({
    ageHours: input.ageHours ?? 24,
    stabilityHours: input.stabilityHours ?? 72,
    accessCount: input.accessCount ?? 3,
    neuromodulator: input.neuromodulator ?? 'balanced',
  });
  if (!retention.ok) return retention;

  const query = redactMemoryText(String(input.query ?? 'stdp loopback recall')).slice(0, 240);
  const engrams = Array.isArray(input.engrams) && input.engrams.length > 0
    ? input.engrams.slice(0, 32).map((e, i) => ({
        id: redactMemoryText(String(e?.id || `custom-${i + 1}`)),
        shortId: redactMemoryText(String(e?.id || `custom-${i + 1}`)).slice(0, 8),
        category: redactMemoryText(String(e?.category || 'episodic')),
        text: redactMemoryText(String(e?.text || '')).slice(0, 420),
        tags: Array.isArray(e?.tags) ? e.tags.slice(0, 8).map((t) => redactMemoryText(String(t))) : [],
        importance: clamp(Number(e?.importance ?? 0.6), 0, 1),
        accessCount: Math.max(0, Math.round(Number(e?.accessCount ?? 1))),
        ageHours: Math.max(0, Number(e?.ageHours ?? 12)),
        synapseCount: Math.max(0, Math.round(Number(e?.synapseCount ?? 0))),
      }))
    : snap.engrams;

  const recall = runHybridRecall(engrams, {
    query,
    weights: input.weights || DEFAULT_RECALL_WEIGHTS,
    neuromodulator: input.neuromodulator ?? 'balanced',
    stabilityHours: input.stabilityHours ?? 72,
    limit: input.limit ?? 10,
  });

  const graphForTrace = snap.graph;
  const trace = computeAssociativeTrace(graphForTrace, {
    seedNodeId: String(input.seedNodeId || recall.results[0]?.id || ''),
    maxHops: input.maxHops ?? 2,
  });

  const curve = sampleStdpCurve({
    aPlus: stdp.effectiveAPlus / resolveNeuromodulatorProfile(stdp.neuromodulator).ltpGain,
    aMinus: stdp.effectiveAMinus / resolveNeuromodulatorProfile(stdp.neuromodulator).ltdGain,
    tauPlusMs: stdp.tauPlusMs,
    tauMinusMs: stdp.tauMinusMs,
    neuromodulator: stdp.neuromodulator,
    stepMs: 10,
  });

  const payload = redactMemoryPayload({
    ok: true,
    schemaVersion: NETRUNNER_MEMORY_SCHEMA_VERSION,
    readOnly: true,
    stdp,
    deltaWAtZero: computeStdpDelta(0, { neuromodulator: stdp.neuromodulator }).deltaW,
    retention,
    recall,
    associativeTrace: trace,
    stdpCurveSample: curve,
  });

  const receiptSha256 = sha256Hex(
    JSON.stringify({
      schemaVersion: payload.schemaVersion,
      stdp: { dt: stdp.deltaTMs, dw: stdp.deltaW, mod: stdp.neuromodulator },
      retention: { r: retention.retention, s: retention.effectiveStabilityHours },
      query: recall.query,
      topIds: recall.results.slice(0, 5).map((r) => `${r.id}:${r.compositeScore}`),
      seedId: trace.seedId,
    }),
  );

  return {
    ...payload,
    receiptSha256,
  };
}

function shellSingleQuote(str) {
  return `'${String(str ?? '').replace(/'/g, "'\\''")}'`;
}

/**
 * Generates strictly copy-only safe CLI & loopback curl playbooks (zero shell execution in browser).
 */
export function synthesizeMemoryPlaybooks({ query = 'stdp loopback', limit = 12 } = {}) {
  const safeQuery = redactMemoryText(String(query || 'stdp loopback')).replace(/[\r\n]+/g, ' ').trim().slice(0, 120);
  const safeLimit = clamp(Math.round(Number(limit) || 12), 1, 50);
  const encodedQ = encodeURIComponent(safeQuery);
  return [
    {
      id: 'zoth-open',
      title: 'Open Workstation in Zoth CLI',
      safety: 'READ-ONLY',
      command: 'zoth open netrunner-memory',
      description: 'Prints canonical route metadata and opens the Lucy Netrunner Memory Hub workstation.',
    },
    {
      id: 'daemon-health',
      title: 'Probe Standing :8094 Health (Read-Only)',
      safety: 'READ-ONLY',
      command: 'curl -s http://127.0.0.1:8094/health',
      description: 'Returns {status, version, service, timestamp} without mutating any engrams.',
    },
    {
      id: 'daemon-stats',
      title: 'Inspect Live Engram & Synapse Counts (Read-Only)',
      safety: 'READ-ONLY',
      command: 'curl -s http://127.0.0.1:8094/api/stats',
      description: 'Returns total_memories, total_synapses, synaptic_density, and category counts.',
    },
    {
      id: 'daemon-memories',
      title: 'Sample Recent Engrams (Read-Only)',
      safety: 'READ-ONLY',
      command: `curl -s ${shellSingleQuote(`http://127.0.0.1:8094/api/memories?limit=${safeLimit}`)}`,
      description: 'Fetches bounded read-only engram records from the local SQLite WAL daemon.',
    },
    {
      id: 'studio-bridge',
      title: 'Query Hardened Studio Read-Only Bridge (:3000)',
      safety: 'READ-ONLY',
      command: 'curl -s http://127.0.0.1:3000/api/studio/netrunner-memory',
      description: 'Host/Origin-checked loopback snapshot with automatic ~/ path redaction and SHA-256 receipt.',
    },
    {
      id: 'studio-eval',
      title: 'Run Deterministic Server STDP + Recall Verification',
      safety: 'PURE MATH · NO WRITES',
      command: `curl -s -X POST http://127.0.0.1:3000/api/studio/netrunner-memory/evaluate -H 'Content-Type: application/json' -d ${shellSingleQuote(JSON.stringify({ deltaTMs: 12, neuromodulator: 'dopamine', query: safeQuery }))}`,
      description: 'Evaluates STDP + BM25/cosine recall server-side without writing to :8094 or disk.',
    },
    {
      id: 'daemon-serve',
      title: 'Start Standalone Neuro-Memory Daemon (Local Terminal)',
      safety: 'LOCAL DAEMON',
      command: 'python3 -m neuro_memory_daemon.cli serve --port 8094',
      description: 'Launches the canonical Python module entrypoint bound to 127.0.0.1:8094.',
    },
    {
      id: 'daemon-query-url',
      title: 'Read-Only Graph Topology Probe',
      safety: 'READ-ONLY',
      command: `curl -s ${shellSingleQuote(`http://127.0.0.1:8094/api/graph?q=${encodedQ}`)}`,
      description: 'Reads synaptic graph nodes and weighted edges from the standing daemon.',
    },
  ];
}

/**
 * Neutralizes CSV spreadsheet formula injection (=, +, -, @, tab, CR) and quotes safely.
 */
export function escapeCsvFormulaCell(value) {
  let str = redactMemoryText(String(value ?? '')).replace(/\r?\n/g, ' ');
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates sanitized JSON, Markdown Dossier, and Formula-Safe CSV exports with SHA-256 receipt.
 */
export function formatNetrunnerMemoryExports(snapshot, evalResult, playbooks = []) {
  const snap = snapshot || buildOfflineNetrunnerMemorySnapshot();
  const ev = evalResult || evaluateNetrunnerMemory({}, snap);

  const exportObj = redactMemoryPayload({
    schemaVersion: NETRUNNER_MEMORY_SCHEMA_VERSION,
    workstation: 'netrunner-memory',
    name: 'Lucy Netrunner Memory Hub',
    mode: snap.mode,
    readOnly: true,
    daemonOnline: snap.daemonOnline,
    checkedAt: snap.checkedAt,
    summary: snap.summary,
    stdp: ev.stdp,
    retention: ev.retention,
    recall: {
      query: ev.recall?.query || '',
      weights: ev.recall?.weights || DEFAULT_RECALL_WEIGHTS,
      results: (ev.recall?.results || []).slice(0, 12),
    },
    associativeTrace: ev.associativeTrace,
    playbooks: (playbooks || []).map((p) => ({ id: p.id, safety: p.safety, command: p.command })),
    attribution: 'Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform',
  });

  const receiptSha256 = sha256Hex(JSON.stringify(exportObj));
  const json = JSON.stringify({ ...exportObj, receiptSha256 }, null, 2);

  const mdLines = [
    '# Lucy Netrunner Memory Hub — Verified Cortex Dossier',
    '',
    `- **Schema Version:** \`${NETRUNNER_MEMORY_SCHEMA_VERSION}\``,
    `- **Runtime Mode:** \`${snap.mode}\` (\`readOnly: true\`, daemon \`127.0.0.1:8094\` ${snap.daemonOnline ? 'ONLINE' : 'OFFLINE'})`,
    `- **Cortex Counts:** \`${snap.summary.totalMemories}\` engrams · \`${snap.summary.totalSynapses}\` synapses · density \`${snap.summary.synapticDensity}\` · \`${snap.summary.categoryCount}\` categories`,
    `- **STDP Evaluation:** \`${ev.stdp.formula}\` (Neuromodulator: \`${ev.stdp.neuromodulator}\`, next weight \`${ev.stdp.nextWeight}\`)`,
    `- **Ebbinghaus Retention:** \`${ev.retention.formula}\` (Half-life \`${ev.retention.halfLifeHours}h\`)`,
    `- **Receipt SHA-256:** \`${receiptSha256}\``,
    '',
    '## Hybrid Recall Results',
    '',
    '| Rank | ID | Category | Composite | BM25 | Cosine | Retention | Excerpt |',
    '| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |',
    ...(ev.recall?.results || []).slice(0, 12).map((r, i) =>
      `| ${i + 1} | \`${r.shortId}\` | \`${r.category}\` | \`${r.compositeScore}\` | \`${r.bm25Score}\` | \`${r.cosineScore}\` | \`${r.retentionScore}\` | ${r.text.replace(/\|/g, '/').slice(0, 96)} |`,
    ),
    '',
    '---',
    '_Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform_',
  ];

  const csvHeader = [
    'rank',
    'id',
    'category',
    'composite_score',
    'bm25_score',
    'cosine_score',
    'retention_score',
    'importance',
    'access_count',
    'tags',
    'text',
  ].join(',');

  const csvRows = (ev.recall?.results || []).slice(0, 24).map((r, idx) =>
    [
      idx + 1,
      escapeCsvFormulaCell(r.id),
      escapeCsvFormulaCell(r.category),
      r.compositeScore,
      r.bm25Score,
      r.cosineScore,
      r.retentionScore,
      r.importance,
      r.accessCount,
      escapeCsvFormulaCell((r.tags || []).join(';')),
      escapeCsvFormulaCell(r.text),
    ].join(','),
  );

  return {
    receiptSha256,
    json,
    markdown: mdLines.join('\n'),
    csv: [csvHeader, ...csvRows].join('\n'),
  };
}
