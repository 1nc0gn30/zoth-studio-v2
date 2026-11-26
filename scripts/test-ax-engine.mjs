#!/usr/bin/env node
/**
 * Unit & Cross-Manifest Parity Test Suite for Zoth AX Powerhouse Engine
 * Run: node --test scripts/test-ax-engine.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import {
  validateLlmsTxt,
  validateAiTxt,
  validateRobotsTxt,
  validateMcpJson,
  validateAgentJson,
  validateJsonLdGraph,
  validateAxSpec,
  compileAxBundle,
  DEFAULT_AX_COMPILER_CONFIG,
} from '../src/utils/axContractEngine.js';
import { microTools } from '../src/data/toolsData.js';
import { workstations } from '../src/data/workstations.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

test('src/utils/axContractEngine.js and server/ax-contract-engine.mjs stay byte-identical', () => {
  const srcBuf = fs.readFileSync(path.join(root, 'src/utils/axContractEngine.js'));
  const srvBuf = fs.readFileSync(path.join(root, 'server/ax-contract-engine.mjs'));
  assert.equal(sha256(srcBuf), sha256(srvBuf));
});

test('compileAxBundle synthesizes 6 valid A+ contracts with accurate byte & token stats', () => {
  const bundle = compileAxBundle(DEFAULT_AX_COMPILER_CONFIG);
  assert.equal(Object.keys(bundle.files).length, 6);
  assert.ok(bundle.totalBytes > 1500);
  assert.ok(bundle.totalEstimatedTokens > 300);
  for (const s of bundle.summaries) {
    assert.equal(s.valid, true, `${s.filename} should be valid`);
    assert.ok(s.score >= 95, `${s.filename} score (${s.score}) should be >= 95`);
    assert.equal(s.grade, 'A+');
  }
});

test('validateLlmsTxt detects missing structure, fake email, and stale tool/workstation counts', () => {
  const bad = validateLlmsTxt('Studio with 80 tools and 43 workstations contact sovereign@zoth.studio', {
    tools: microTools.length,
    workstations: workstations.length,
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.some((e) => /H1/i.test(e)));
  assert.ok(bad.errors.some((e) => /sovereign@zoth\.studio/i.test(e)));
  assert.ok(bad.warnings.some((w) => /Stale tool count/i.test(w)));
  assert.ok(bad.warnings.some((w) => /Stale workstation count/i.test(w)));
});

test('validateAiTxt flags missing directives and fabricated email', () => {
  const bad = validateAiTxt('# ai.txt\nAgent-Contact: sovereign@zoth.studio');
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.length >= 2);
});

test('validateRobotsTxt enforces wildcard allow, frontier crawlers, Sitemap HTTPS, and Crawl-delay 0', () => {
  const bad = validateRobotsTxt('User-agent: *\nDisallow: /\nCrawl-delay: 5');
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.some((e) => /Disallow: \//i.test(e)));
  assert.ok(bad.errors.some((e) => /Sitemap/i.test(e)));
  assert.ok(bad.missingCrawlers.length === 4);

  const liveRobots = fs.readFileSync(path.join(root, 'public/robots.txt'), 'utf8');
  const good = validateRobotsTxt(liveRobots);
  assert.equal(good.valid, true);
  assert.ok(good.score >= 95, `live public/robots.txt score was ${good.score}`);
});

test('validateMcpJson flags duplicate phrases, commercial copy, and missing resources', () => {
  const bad = validateMcpJson(
    JSON.stringify({
      name: 'bad-mcp',
      description: 'NullAI (nullai.tech), NullAI (nullai.tech) with Stripe Checkout Links',
      resources: [],
    })
  );
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.some((e) => /mcpVersion/i.test(e)));
  assert.ok(bad.warnings.some((w) => /Duplicate/i.test(w)));
  assert.ok(bad.warnings.some((w) => /Commercial/i.test(w)));
});

test('validateAgentJson flags instantCheckout true and missing endpoints', () => {
  const bad = validateAgentJson(
    JSON.stringify({
      name: 'Agent',
      url: 'http://insecure.example',
      capabilities: { instantCheckout: true },
    })
  );
  assert.equal(bad.valid, false);
  assert.ok(bad.warnings.some((w) => /instantCheckout/i.test(w)));
});

test('validateJsonLdGraph requires @context, SoftwareApplication/WebApplication, and FAQPage', () => {
  const bad = validateJsonLdGraph(JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'WebPage' }] }));
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.some((e) => /SoftwareApplication/i.test(e)));
  assert.ok(bad.errors.some((e) => /FAQPage/i.test(e)));

  const bundle = compileAxBundle(DEFAULT_AX_COMPILER_CONFIG);
  const good = validateJsonLdGraph(bundle.files['schema-graph.jsonld']);
  assert.equal(good.valid, true);
  assert.equal(good.score, 100);
});

test('Live public/ AX manifests match ground truth (85 tools / 44 workstations) with zero drift', () => {
  const counts = { tools: microTools.length, workstations: workstations.length };
  assert.equal(counts.tools, 85);
  assert.equal(counts.workstations, 44);

  const checks = [
    ['llms.txt', 'public/llms.txt'],
    ['llms.txt', 'public/llms-full.txt'],
    ['ai.txt', 'public/ai.txt'],
    ['robots.txt', 'public/robots.txt'],
    ['mcp.json', 'public/.well-known/mcp.json'],
    ['agent.json', 'public/.well-known/agent.json'],
  ];

  for (const [spec, rel] of checks) {
    const content = fs.readFileSync(path.join(root, rel), 'utf8');
    const res = validateAxSpec(spec, content, counts);
    const warnings = rel.endsWith('llms-full.txt')
      ? res.warnings.filter((w) => !/Estimated token budget/i.test(w))
      : res.warnings;
    assert.equal(res.valid, true, `${rel} invalid: ${res.errors.join('; ')}`);
    assert.equal(warnings.length, 0, `${rel} has warnings: ${warnings.join('; ')}`);
  }

  // Verify ai-plugin.json, api/index.json, api/services.json
  const aiPlugin = JSON.parse(fs.readFileSync(path.join(root, 'public/.well-known/ai-plugin.json'), 'utf8'));
  assert.match(aiPlugin.name_for_human, /85/);
  assert.match(aiPlugin.name_for_model, /85/);
  assert.doesNotMatch(aiPlugin.name_for_model, /44_tool/);

  const apiIndex = JSON.parse(fs.readFileSync(path.join(root, 'public/api/index.json'), 'utf8'));
  assert.equal(apiIndex.counts.tools, 85);
  assert.equal(apiIndex.counts.workstations, 44);
  assert.equal(apiIndex.openAccess, true);

  const services = JSON.parse(fs.readFileSync(path.join(root, 'public/api/services.json'), 'utf8'));
  assert.equal(services.openAccess, true);
  assert.doesNotMatch(JSON.stringify(services), /FOUNDER25/);
});

test('public/.well-known/{llms.txt,llms-full.txt,ai.txt} are byte-identical to root copies', () => {
  for (const name of ['llms.txt', 'llms-full.txt', 'ai.txt']) {
    const rootBuf = fs.readFileSync(path.join(root, 'public', name));
    const wkBuf = fs.readFileSync(path.join(root, 'public', '.well-known', name));
    assert.equal(sha256(rootBuf), sha256(wkBuf), `.well-known/${name} diverged from public/${name}`);
  }
});
