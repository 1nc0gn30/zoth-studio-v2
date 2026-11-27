import test from 'node:test';
import assert from 'node:assert/strict';
import {
  decomposeQuery,
  detectCitationCycles,
  computeTrustRank,
  traceProvenance,
  detectContradictions,
  runDeepSearchSynthesis,
} from '../src/utils/deepSearchEngine.js';

test('decomposeQuery dynamically tailors sub-queries to arbitrary custom topics', () => {
  const plan = decomposeQuery('Zero-Copy io_uring Networking in Linux 6.12', 'deep');
  assert.equal(plan.angles.length, 5);
  assert.ok(plan.subQueries.length >= 5);
  assert.ok(plan.subQueries.every((q) => q.query.includes('Zero-Copy io_uring')));
  assert.ok(plan.keywords.includes('io_uring') || plan.keywords.includes('networking'));
});

test('detectCitationCycles and traceProvenance distinguish DAGs from circular reporting', () => {
  const nodes = [
    { id: 'SRC-1', type: 'primary_source', label: 'Primary', credibility: 95 },
    { id: 'CLM-1', type: 'claim', label: 'Claim 1', credibility: 85 },
    { id: 'CLM-2', type: 'claim', label: 'Claim 2', credibility: 85 },
  ];
  const cyclic = [
    { source: 'CLM-1', target: 'CLM-2', relation: 'cites' },
    { source: 'CLM-2', target: 'CLM-1', relation: 'cites' },
  ];
  assert.equal(detectCitationCycles(nodes, cyclic).length, 1);

  const dag = [
    { source: 'SRC-1', target: 'CLM-1', relation: 'supports' },
    { source: 'CLM-1', target: 'CLM-2', relation: 'supports' },
  ];
  assert.equal(detectCitationCycles(nodes, dag).length, 0);
  const tr = traceProvenance(nodes, dag, 'CLM-2');
  assert.equal(tr.isGrounded, true);
  assert.equal(tr.rootSources[0].id, 'SRC-1');

  const auth = computeTrustRank(nodes, dag);
  assert.ok(auth['SRC-1'] > 0);
});

test('detectContradictions flags >20% numeric divergence', () => {
  const report = detectContradictions([
    { id: 'C1', attribute: 'throughput', numericValue: 100 },
    { id: 'C2', attribute: 'throughput', numericValue: 40 },
  ]);
  assert.equal(report.contradictionsCount, 1);
  assert.equal(report.isDisputed, true);
});

test('runDeepSearchSynthesis dynamically updates for custom queries and exports Markdown, JSON, BibTeX', () => {
  const q1 = runDeepSearchSynthesis('ML-KEM Lattice Cryptography Side-Channel Defenses', 'deep');
  const q2 = runDeepSearchSynthesis('WebGPU Compute Shader Matrix Multiplication', 'quick');

  assert.notEqual(q1.plan.planId, q2.plan.planId);
  assert.equal(q2.plan.angles.length, 3);
  assert.ok(q1.claims.every((c) => c.statement.includes('ML-KEM Lattice Cryptography')));
  assert.ok(q1.markdownDossier.includes('ML-KEM Lattice Cryptography'));
  assert.equal(JSON.parse(q1.jsonDossier).query, q1.query);
  assert.ok(q1.bibtexDossier.includes('@article{'));
  assert.ok(q1.bibtexDossier.includes('title = {'));
});
