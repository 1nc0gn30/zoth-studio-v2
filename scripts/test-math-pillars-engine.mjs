import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MATH_PILLARS_ENGINE_VERSION,
  PILLAR_IDS,
  solveLinearAlgebra,
  solveMultivariableCalculus,
  solveProbabilityInfo,
  solveHessianManifolds,
  solveLyapunovDynamics,
  computeStdpDeltaW,
  solveStdpPlasticity,
  solveBftQuorum,
  evaluatePillar,
  exportEvaluationJson,
  exportEvaluationMarkdown,
  exportEvaluationCsv,
  exportEvaluationLatex,
  sanitizeCsvCell,
  getMathPillarsSummary,
} from '../src/utils/mathPillarsEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('browser and server math-pillars engine files are byte-identical and free of eval/Math.random', () => {
  const clientSrc = fs.readFileSync(path.join(rootDir, 'src/utils/mathPillarsEngine.js'), 'utf8');
  const serverSrc = fs.readFileSync(path.join(rootDir, 'server/math-pillars-engine.mjs'), 'utf8');
  assert.equal(clientSrc, serverSrc, 'src/utils/mathPillarsEngine.js and server/math-pillars-engine.mjs diverged');
  assert.ok(!/\beval\s*\(/.test(clientSrc), 'eval() forbidden in mathPillarsEngine');
  assert.ok(!/new\s+Function\s*\(/.test(clientSrc), 'new Function() forbidden in mathPillarsEngine');
  assert.ok(!/Math\.random\s*\(/.test(clientSrc), 'Math.random() forbidden in mathPillarsEngine');
});

test('Pillar I (linear): cosine similarity, attention weights sum to 1, and KV-cache exact bytes', () => {
  const res = solveLinearAlgebra({
    vectorA: [3, 4],
    vectorB: [3, 4],
    layers: 32,
    heads: 16,
    dHead: 128,
    seqLen: 4096,
    dtypeBytes: 2,
  });
  assert.equal(res.data.dotProduct, 25);
  assert.equal(res.data.normA, 5);
  assert.equal(res.data.normB, 5);
  assert.equal(res.data.cosineSimilarity, 1);
  const weightSum = res.data.attentionWeights.reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(weightSum - 1.0) < 1e-4, `Attention weights must sum to 1, got ${weightSum}`);
  assert.equal(res.data.kvCacheBytes, 2 * 32 * 16 * 128 * 4096 * 2);
  assert.equal(res.data.kvCacheMiB, 1024);
});

test('Pillar I (linear): zero vector and NaN inputs handled safely without NaN/Infinity', () => {
  const res = solveLinearAlgebra({ vectorA: [0, 0, 0], vectorB: [1, 2, 3], seqLen: NaN, heads: Infinity });
  assert.equal(res.data.cosineSimilarity, 0);
  assert.ok(Number.isFinite(res.data.kvCacheMiB));
  assert.ok(Number.isFinite(res.data.attentionOutput));
});

test('Pillar II (calculus): decoupled AdamW decreases quadratic loss and enforces L2 gradient clipping', () => {
  const res = solveMultivariableCalculus({
    learningRate: 0.08,
    gradClip: 0.5,
    theta0: 3.0,
    curvature: 2.0,
    steps: 25,
    loraRank: 16,
    dIn: 4096,
    dOut: 4096,
  });
  assert.ok(res.data.finalLoss < res.data.initialLoss, 'AdamW must reduce quadratic loss');
  assert.ok(res.data.clippedCount > 0, 'Initial gradient 6.0 > 0.5 clip must trigger clipping');
  assert.equal(res.data.loraParams, 16 * (4096 + 4096));
  assert.equal(res.data.trajectory.length, 25);
});

test('Pillar III (probability): log-sum-exp softmax, top-p nucleus, Shannon entropy, perplexity, and KL divergence', () => {
  const sharp = solveProbabilityInfo({ logits: [5, 0, 0, 0], temperature: 0.2, topP: 0.9 });
  const flat = solveProbabilityInfo({ logits: [1, 1, 1, 1], temperature: 1.0, topP: 0.9 });
  assert.ok(sharp.data.entropyBits < flat.data.entropyBits, 'Lower temperature & peaked logits must lower entropy');
  assert.ok(Math.abs(flat.data.entropyBits - 2.0) < 1e-4, 'Uniform 4-token distribution must have H = 2 bits');
  assert.ok(Math.abs(flat.data.perplexity - 4.0) < 1e-4, 'Uniform 4-token distribution must have PPL = 4');
  assert.ok(Math.abs(flat.data.klDivergenceBits) < 1e-4, 'Uniform vs uniform KL must be 0');
  assert.equal(sharp.data.nucleusCount, 1);
  assert.equal(flat.data.nucleusCount, 4);
});

test('Pillar IV (hessian): symmetric 2x2 eigenvalues, condition number, saddle classification, and HVP accuracy', () => {
  const bowl = solveHessianManifolds({ h11: 4, h12: 0, h22: 1, v1: 2, v2: 3 });
  assert.equal(bowl.data.lambda1, 4);
  assert.equal(bowl.data.lambda2, 1);
  assert.equal(bowl.data.conditionNumber, 4);
  assert.match(bowl.data.classification, /Positive-Definite Bowl/);
  assert.ok(bowl.data.hvpResidual < 1e-6);

  const saddle = solveHessianManifolds({ h11: 3, h12: 0, h22: -2 });
  assert.match(saddle.data.classification, /Indefinite Saddle/);

  const singular = solveHessianManifolds({ h11: 2, h12: 0, h22: 0 });
  assert.equal(singular.data.isSingular, true);
  assert.equal(singular.data.conditionNumber, null);
});

test('Pillar V (lyapunov): clamped exponential divergence prevents overflow and classifies regimes', () => {
  const huge = solveLyapunovDynamics({ lambda: 20, timeSec: 200 });
  assert.equal(huge.data.wasClamped, true);
  assert.equal(huge.data.clampedExponent, 50);
  assert.ok(Number.isFinite(huge.data.divergenceRatio), 'Divergence must remain finite');

  const stable = solveLyapunovDynamics({ lambda: -0.5, timeSec: 4.0, entropyH: 0, maxEntropyH: 4 });
  assert.match(stable.data.stabilityClass, /Asymptotically Stable/);
  assert.ok(Math.abs(stable.data.estimatedLambda - -0.5) < 1e-4);
  assert.equal(stable.data.coherenceIndex, 1);
});

test('Pillar VI (stdp): exact neutral Δw(0) = 0, causal LTP > 0, anti-causal LTD < 0, and bounded [0, 1] trace', () => {
  const zeroPt = computeStdpDeltaW(0);
  assert.equal(zeroPt.deltaW, 0, 'Δw(0) MUST equal 0 (strictly neutral)');
  assert.match(zeroPt.regime, /Neutral/);

  const ltp = computeStdpDeltaW(10);
  assert.ok(ltp.deltaW > 0, 'Causal Δt > 0 must yield positive LTP');
  const ltd = computeStdpDeltaW(-10);
  assert.ok(ltd.deltaW < 0, 'Anti-causal Δt < 0 must yield negative LTD');

  const traceRes = solveStdpPlasticity({
    deltaTMs: 0,
    initialWeight: 0.95,
    learningRate: 0.5,
    spikeDeltas: [2, 2, 2, 2, -2, -2, -2, -2, -2, -2],
  });
  assert.equal(traceRes.data.deltaW, 0);
  assert.equal(traceRes.data.curve.length, 33);
  for (const step of traceRes.data.trace) {
    assert.ok(step.weightAfter >= 0 && step.weightAfter <= 1, 'Synapse weight must stay bounded in [0, 1]');
  }
});

test('Byzantine BFT Quorum: exact N >= 3f + 1, Q = 2f + 1, and f_max = floor((N - 1) / 3)', () => {
  const safe = solveBftQuorum({ nodes: 7, faulty: 2 });
  assert.equal(safe.data.minNodesRequired, 7);
  assert.equal(safe.data.quorum, 5);
  assert.equal(safe.data.maxTolerableFaults, 2);
  assert.equal(safe.data.safetyHolds, true);
  assert.equal(safe.data.livenessHolds, true);

  const unsafe = solveBftQuorum({ nodes: 6, faulty: 2 });
  assert.equal(unsafe.data.safetyHolds, false);
  assert.equal(unsafe.data.maxTolerableFaults, 1);
});

test('evaluatePillar dispatcher validates pillar IDs and produces deterministic 64-hex SHA-256 receipts', () => {
  const bad = evaluatePillar('unknown-pillar', {});
  assert.equal(bad.ok, false);
  assert.match(bad.error, /Unknown pillar/);

  for (const id of PILLAR_IDS) {
    const r1 = evaluatePillar(id, {});
    const r2 = evaluatePillar(id, {});
    assert.equal(r1.ok, true);
    assert.equal(r1.schemaVersion, MATH_PILLARS_ENGINE_VERSION);
    assert.match(r1.receiptSha256, /^[0-9a-f]{64}$/);
    assert.equal(r1.receiptSha256, r2.receiptSha256, `Non-deterministic receipt for ${id}`);
  }
});

test('exporters produce valid JSON, Markdown, formula-safe CSV, and LaTeX without /home/ leaks', () => {
  const res = evaluatePillar('stdp', { deltaTMs: 0 });
  const jsonStr = exportEvaluationJson(res);
  assert.equal(JSON.parse(jsonStr).pillarId, 'stdp');

  const md = exportEvaluationMarkdown(res);
  assert.match(md, /Pillar VI: Neuromorphic STDP/);
  assert.match(md, /Neal Frazier Tech/);

  const csv = exportEvaluationCsv(res);
  assert.match(csv, /"pillar","metric","value"/);
  assert.equal(sanitizeCsvCell('=cmd|"/C calc"!A0'), '"\'=cmd|""/C calc""!A0"');
  assert.equal(sanitizeCsvCell('/home/alice/secret.txt'), '"~/secret.txt"');

  const tex = exportEvaluationLatex(res);
  assert.match(tex, /\\begin\{equation\}/);
  assert.match(tex, /\\end\{itemize\}/);
});

test('getMathPillarsSummary reports 6 pillars + BFT quorum and passing self-verification', () => {
  const summary = getMathPillarsSummary();
  assert.equal(summary.ok, true);
  assert.equal(summary.sixPillarsCount, 6);
  assert.equal(summary.pillarCount, 7);
  assert.equal(summary.includesBftQuorum, true);
  assert.equal(summary.verification.stdpZeroNeutral, true);
  assert.equal(summary.verification.lyapunovClamped, true);
  assert.equal(summary.verification.bftSevenTwoSafe, true);
});

test('Pillar V (lyapunov): extreme negative exponent clamps cleanly to -50 without underflow NaN', () => {
  const neg = solveLyapunovDynamics({ lambda: -10, timeSec: 20 });
  assert.equal(neg.data.wasClamped, true);
  assert.equal(neg.data.clampedExponent, -50);
  assert.ok(Number.isFinite(neg.data.divergenceRatio) && neg.data.divergenceRatio > 0);
});

test('LaTeX exporter escapes dangerous control characters cleanly', () => {
  const res = evaluatePillar('bft', { nodes: 4, faulty: 1 });
  const tex = exportEvaluationLatex(res);
  assert.match(tex, /N \\ge 3f \+ 1/);
  assert.ok(!/\/home\/[a-z0-9_-]+\//i.test(tex));
});
