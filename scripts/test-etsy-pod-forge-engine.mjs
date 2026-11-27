import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ETSY_POD_FORGE_VERSION,
  POD_CADRES,
  POD_PRESETS,
  MCP_TOOLS,
  PROMPT_VAULT_RECIPES,
  auditEtsyListing,
  normalizeTitle,
  cleanTagsList,
  calculatePodMargins,
  validateCanvasSpec,
  buildFulfillmentPayloads,
} from '../src/utils/etsyPodForgeEngine.js';

test('Canonical version, 5 cadres with real Printify/Gelato IDs, and 6 MCP tools', () => {
  assert.equal(ETSY_POD_FORGE_VERSION, '2.6.0');
  assert.equal(POD_CADRES.length, 5);
  assert.equal(MCP_TOOLS.length, 6);
  assert.ok(PROMPT_VAULT_RECIPES.length >= 10);

  const map = Object.fromEntries(POD_CADRES.map((c) => [c.id, c]));
  assert.equal(map.apparel.printifyBlueprintId, 638);
  assert.equal(map.apparel.printifyProviderId, 29);
  assert.equal(map.mugs.printifyBlueprintId, 68);
  assert.equal(map.mugs.printifyProviderId, 26);
  assert.equal(map.totes.printifyBlueprintId, 1090);
  assert.equal(map.totes.printifyProviderId, 3);
  assert.equal(map.wall_art.printifyBlueprintId, 49);
  assert.equal(map.wall_art.printifyProviderId, 29);
  assert.equal(map.crafting.printifyBlueprintId, 554);
  assert.equal(map.crafting.printifyProviderId, 29);
});

test('140-char / 13-tag SEO auditor scores optimized preset high and fixes bad draft', () => {
  const good = auditEtsyListing(POD_PRESETS[0].title, POD_PRESETS[0].tags);
  assert.ok(good.score >= 90, `Expected >= 90, got ${good.score}`);
  assert.equal(good.over20Count, 0);

  const badPreset = POD_PRESETS.find((p) => p.id === 'needs-audit');
  const bad = auditEtsyListing(badPreset.title, badPreset.tags);
  assert.ok(bad.score < 50);

  const fixedTitle = normalizeTitle(badPreset.title);
  const fixedTags = cleanTagsList(badPreset.tags);
  assert.ok(fixedTitle.length <= 140);
  assert.ok(fixedTags.every((t) => t.length <= 20));
  const improved = auditEtsyListing(fixedTitle, fixedTags);
  assert.ok(improved.score > bad.score);
});

test('2026 margin engine handles 0%, 12%, and 15% Offsite Ads and break-even price', () => {
  const m0 = calculatePodMargins({ price: 34.99, buyerShipping: 0, prodCost: 12.50, podShipCost: 0, extraCost: 0, offsiteAdsRate: 0 });
  const m12 = calculatePodMargins({ price: 34.99, buyerShipping: 0, prodCost: 12.50, podShipCost: 0, extraCost: 0, offsiteAdsRate: 0.12 });
  const m15 = calculatePodMargins({ price: 34.99, buyerShipping: 0, prodCost: 12.50, podShipCost: 0, extraCost: 0, offsiteAdsRate: 0.15 });

  assert.equal(m0.netProfit, 18.72);
  assert.equal(m0.netMarginPct, 53.5);
  assert.ok(m0.netProfit > m12.netProfit && m12.netProfit > m15.netProfit);
  assert.ok(m15.breakEvenGross > m12.breakEvenGross && m12.breakEvenGross > m0.breakEvenGross);
});

test('300-DPI canvas spec validator and Printify/Gelato payload builders use cadre-specific IDs', () => {
  const okSpec = validateCanvasSpec({ cadreId: 'apparel', width: 4500, height: 5400, dpi: 300 });
  assert.equal(okSpec.printReady, true);
  const lowDpi = validateCanvasSpec({ cadreId: 'apparel', width: 900, height: 1080, dpi: 72 });
  assert.equal(lowDpi.printReady, false);

  const { printify, gelato } = buildFulfillmentPayloads({
    cadreId: 'mugs',
    title: 'Watercolor Bird Coffee Mug 15oz',
    description: '15oz ceramic mug',
    tags: ['bird mug', 'coffee mug'],
    itemPrice: 21.99,
  });
  assert.equal(printify.blueprint_id, 68);
  assert.equal(printify.print_provider_id, 26);
  assert.notEqual(printify.print_provider_id, 99);
  assert.equal(gelato.apiVersion, 'v4');
  assert.ok(gelato.variants[0].productUid.includes('mug_product'));
});
