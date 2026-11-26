#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STARTER_TEMPLATES,
  validateDag,
  topologicalWaves,
  interpolateTemplate,
  executeTransformNode,
  computeAutoLayout,
  exportDagJson,
  importDagJson,
  exportDagYaml,
  exportDagPython,
} from '../src/utils/dagEngine.js';

test('validateDag accepts all built-in starter templates', () => {
  assert.ok(STARTER_TEMPLATES.length >= 3);
  for (const tpl of STARTER_TEMPLATES) {
    const v = validateDag(tpl.nodes, tpl.edges);
    assert.equal(v.valid, true, `Template ${tpl.id} should be valid: ${JSON.stringify(v.errors)}`);
    assert.equal(v.cyclePath, null);
  }
});

test('validateDag detects self-loops and 3-node cycles with exact cycle path', () => {
  const nodes = [
    { id: 'a', name: 'Node A', provider: 'transform', prompt: 'run {{input}}' },
    { id: 'b', name: 'Node B', provider: 'transform', prompt: 'run {{a.output}}' },
    { id: 'c', name: 'Node C', provider: 'transform', prompt: 'run {{b.output}}' },
  ];

  const selfLoop = validateDag(nodes, [{ id: 'e1', source: 'a', target: 'a' }]);
  assert.equal(selfLoop.valid, false);
  assert.deepEqual(selfLoop.cyclePath, ['a', 'a']);
  assert.ok(selfLoop.errors.some((e) => e.code === 'SELF_LOOP'));

  const threeCycle = validateDag(nodes, [
    { id: 'e1', source: 'a', target: 'b' },
    { id: 'e2', source: 'b', target: 'c' },
    { id: 'e3', source: 'c', target: 'a' },
  ]);
  assert.equal(threeCycle.valid, false);
  assert.deepEqual(threeCycle.cyclePath, ['a', 'b', 'c', 'a']);
  assert.ok(threeCycle.errors.some((e) => e.code === 'CYCLE_DETECTED'));
});

test('validateDag flags dangling edges, duplicate IDs, and missing prompts', () => {
  const bad = validateDag(
    [
      { id: 'n1', name: 'First', provider: 'transform', prompt: '' },
      { id: 'n1', name: 'Dup', provider: 'transform', prompt: 'ok' },
    ],
    [{ id: 'e1', source: 'n1', target: 'ghost' }],
  );
  assert.equal(bad.valid, false);
  const codes = bad.errors.map((e) => e.code);
  assert.ok(codes.includes('DUPLICATE_NODE_ID'));
  assert.ok(codes.includes('MISSING_PROMPT'));
  assert.ok(codes.includes('DANGLING_EDGE'));
});

test('topologicalWaves groups diamond graph into parallel waves', () => {
  const nodes = [
    { id: 'start', name: 'Start', provider: 'transform', prompt: '{{input}}' },
    { id: 'left', name: 'Left', provider: 'ollama', prompt: '{{start.output}}' },
    { id: 'right', name: 'Right', provider: 'neuro-memory', prompt: '{{start.output}}' },
    { id: 'join', name: 'Join', provider: 'transform', prompt: '{{left.output}} {{right.output}}' },
  ];
  const edges = [
    { source: 'start', target: 'left' },
    { source: 'start', target: 'right' },
    { source: 'left', target: 'join' },
    { source: 'right', target: 'join' },
  ];

  const topo = topologicalWaves(nodes, edges);
  assert.equal(topo.ok, true);
  assert.equal(topo.waves.length, 3);
  assert.deepEqual(topo.waves[0].map((n) => n.id), ['start']);
  assert.deepEqual(topo.waves[1].map((n) => n.id).sort(), ['left', 'right']);
  assert.deepEqual(topo.waves[2].map((n) => n.id), ['join']);
  assert.equal(topo.waveByNodeId.join, 2);
});

test('interpolateTemplate resolves {{input}} and {{nodeId.output}} without eval', () => {
  const out = interpolateTemplate(
    'In={{ input }} | A={{node_a.output}} | Missing={{missing_node.output}}',
    { node_a: 'VERIFIED_A' },
    'PAYLOAD_1',
  );
  assert.equal(out, 'In=PAYLOAD_1 | A=VERIFIED_A | Missing=[missing:missing_node.output]');
});

test('executeTransformNode produces deterministic real outputs for all modes', () => {
  const jsonRes = executeTransformNode({ name: 'Val', model: 'json-validate' }, '{"port": 3000, "ok": true}');
  assert.equal(jsonRes.ok, true);
  assert.match(jsonRes.output, /VALID JSON/);
  assert.match(jsonRes.output, /"port": 3000/);

  const regexRes = executeTransformNode(
    { name: 'Ext', model: 'regex-extract' },
    'Probe http://127.0.0.1:3000/api/studio/composer/providers CVE-2026-1234',
  );
  assert.equal(regexRes.ok, true);
  assert.match(regexRes.output, /\/api\/studio\/composer\/providers/);
  assert.match(regexRes.output, /CVE-2026-1234/);

  const schemaRes = executeTransformNode({ name: 'Ver', model: 'schema-verify' }, 'Loopback 127.0.0.1:11434 service');
  assert.equal(schemaRes.ok, true);
  assert.match(schemaRes.output, /\[PASS\] Loopback hygiene/);

  const mdRes = executeTransformNode({ name: 'Brief', model: 'markdown-brief' }, '## Audit\n- Zero leaks\n- Verified DAG');
  assert.equal(mdRes.ok, true);
  assert.match(mdRes.output, /# Brief/);
});

test('computeAutoLayout assigns non-overlapping coordinates per wave', () => {
  const tpl = STARTER_TEMPLATES[0];
  const layout = computeAutoLayout(tpl.nodes, tpl.edges);
  assert.ok(layout.width >= 680);
  assert.ok(layout.height >= 340);
  assert.ok(layout.positions.intake_extract.x < layout.positions.ollama_auditor.x);
  assert.ok(layout.positions.ollama_auditor.x < layout.positions.remediation_brief.x);
  assert.notEqual(layout.positions.memory_precedent.y, layout.positions.ollama_auditor.y);
});

test('exportDagJson / importDagJson / exportDagYaml / exportDagPython round-trip & reject malformed input', () => {
  const tpl = STARTER_TEMPLATES[0];
  const jsonStr = exportDagJson(tpl);
  const imported = importDagJson(jsonStr);
  assert.equal(imported.ok, true);
  assert.equal(imported.dag.nodes.length, tpl.nodes.length);
  assert.equal(imported.dag.edges.length, tpl.edges.length);

  const badSyntax = importDagJson('{not json');
  assert.equal(badSyntax.ok, false);
  assert.match(badSyntax.error, /Invalid JSON/);

  const badSchema = importDagJson(JSON.stringify({ nodes: [] }));
  assert.equal(badSchema.ok, false);

  const yamlStr = exportDagYaml(tpl);
  assert.match(yamlStr, /schema: "zoth\/agent-dag\/v2"/);
  assert.match(yamlStr, /intake_extract/);

  const pyStr = exportDagPython(tpl);
  assert.match(pyStr, /#!\/usr\/bin\/env python3/);
  assert.match(pyStr, /127\.0\.0\.1:11434\/api\/chat/);
  assert.match(pyStr, /127\.0\.0\.1:18000\/v1\/chat\/completions/);
  assert.match(pyStr, /ThreadPoolExecutor/);
});
