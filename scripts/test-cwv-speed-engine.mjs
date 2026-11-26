import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CWV_VERSION,
  DEFAULT_SAMPLE_HTML,
  auditHtml,
  transformHtml,
  compareDiff,
  generateSpeculationRules,
  auditPerformanceBudget,
} from '../src/utils/cwvSpeedEngine.js';

test('cwvSpeedEngine version is 2.6.0 and default sample contains zero banned hype words', () => {
  assert.equal(CWV_VERSION, '2.6.0');
  assert.ok(!/next-gen|revolutionary|world-class|cutting-edge/i.test(DEFAULT_SAMPLE_HTML));
});

test('auditHtml differentiates mobile vs desktop latency and detects bottlenecks', () => {
  const mob = auditHtml(DEFAULT_SAMPLE_HTML, 'mobile');
  const desk = auditHtml(DEFAULT_SAMPLE_HTML, 'desktop');
  assert.ok(mob.metrics.lcp.value > desk.metrics.lcp.value);
  assert.ok(mob.metrics.ttfb.value > desk.metrics.ttfb.value);
  assert.ok(mob.issues.length >= 4);
});

test('transformHtml scopes defer strictly to <head> and improves CWV score', () => {
  const htmlWithBodyScript = DEFAULT_SAMPLE_HTML.replace(
    '</body>',
    '  <script src="/assets/body-widget.js"></script>\n</body>',
  );
  const { transformed } = transformHtml(htmlWithBodyScript);
  assert.ok(transformed.includes('<script defer src="/assets/app-main.js">'));
  assert.ok(transformed.includes('<script src="/assets/body-widget.js"></script>'));
  assert.ok(transformed.includes('display=swap'));
  assert.ok(transformed.includes('fetchpriority="high"'));

  const diff = compareDiff(htmlWithBodyScript, transformed, 'mobile');
  assert.ok(diff.scoreDelta > 0);
  assert.ok(diff.resolvedCount >= 3);
});

test('compareDiff returns exact 0 deltas for identical HTML documents', () => {
  const same = '<!DOCTYPE html><html><head><title>Same</title></head><body><h1>Same</h1></body></html>';
  const diff = compareDiff(same, same, 'mobile');
  assert.equal(diff.scoreDelta, 0);
  assert.equal(diff.metricDeltas.lcp.delta, 0);
  assert.equal(diff.metricDeltas.cls.delta, 0);
  assert.equal(diff.metricDeltas.inp.delta, 0);
  assert.equal(diff.metricDeltas.fcp.delta, 0);
  assert.equal(diff.metricDeltas.ttfb.delta, 0);
  assert.equal(diff.resolvedCount, 0);
});

test('generateSpeculationRules excludes /checkout and /logout while prerendering /docs', () => {
  const spec = generateSpeculationRules(DEFAULT_SAMPLE_HTML, 'https://example.com', 'balanced');
  assert.ok(spec.prerender.includes('/docs'));
  assert.ok(spec.excluded.includes('/checkout'));
  assert.ok(spec.excluded.includes('/logout'));
  assert.ok(spec.scriptTag.includes('type="speculationrules"'));
});

test('auditPerformanceBudget flags synchronous LoAF blockers and outputs Lighthouse budget.json', () => {
  const bud = auditPerformanceBudget(DEFAULT_SAMPLE_HTML);
  assert.equal(bud.loafRisks.length, 2);
  assert.equal(bud.lighthouseBudgetJson[0].path, '/*');
});
