import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ETSY_CONNECTOR_VERSION,
  MCP_TOOLS,
  TAXONOMY_CATALOG,
  derivePkceChallenge,
  auditListing,
  calculateProfit,
  generatePodPayload,
  buildMcpBundle,
  analyzeQuota,
} from '../src/utils/etsyConnectorEngine.js';

test('RFC 7636 Appendix B SHA-256 PKCE S256 test vector', () => {
  const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
  const expected = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';
  assert.equal(derivePkceChallenge(verifier), expected);
});

test('13-tag SEO auditor validates compliant listing and catches defects', () => {
  const good = auditListing(
    'Botanical Wildflower Heavy Blend Crewneck Sweatshirt, Cottagecore Floral Gift, Garment Dyed Pullover',
    [
      'wildflower crewneck', 'botanical sweatshirt', 'cottagecore gift', 'floral pullover',
      'garden lover gift', 'nature crewneck', 'cozy floral shirt', 'spring botanical',
      'pressed flower art', 'embroidered look', 'comfort colors 1717', 'gift for gardener',
      'aesthetic sweater',
    ],
    'Heavyweight unisex crewneck sweatshirt printed with archival botanical artwork. Includes sizing guide and cold-wash care.'
  );
  assert.equal(good.grade, 'A+');
  assert.equal(good.is_ready_to_publish, true);

  const bad = auditListing('SHORT', ['dup', 'dup', 'this tag is way over twenty characters'], '');
  assert.equal(bad.is_ready_to_publish, false);
  assert.ok(bad.tags_audit.invalid_tags.length === 1);
});

test('Etsy profit engine supports 0%, 12%, and 15% Offsite Ads with exact rounding & break-even', () => {
  const p0 = calculateProfit({ retailPrice: 38.99, podBaseCost: 15.5, shippingCharged: 4.99, offsiteAdsRate: 0 });
  const p12 = calculateProfit({ retailPrice: 38.99, podBaseCost: 15.5, shippingCharged: 4.99, offsiteAdsRate: 0.12 });
  const p15 = calculateProfit({ retailPrice: 38.99, podBaseCost: 15.5, shippingCharged: 4.99, offsiteAdsRate: 0.15 });
  assert.equal(p0.gross_revenue, 43.98);
  assert.equal(p12.gross_revenue, 43.98);
  assert.equal(p12.etsy_fees.offsite_ads_fee, 5.28);
  assert.equal(p15.etsy_fees.offsite_ads_fee, 6.6);
  assert.ok(p0.net_profit > p12.net_profit && p12.net_profit > p15.net_profit);
  assert.ok(p15.break_even_price > p12.break_even_price && p12.break_even_price > p0.break_even_price);
});

test('Printify & Gelato POD payload builders emit accurate provider IDs & Gelato v4 productUid', () => {
  const mugId = 'ceramic_mug_15oz';
  const posterId = 'fine_art_poster_18x24';
  const mug = generatePodPayload({
    provider: 'printify',
    blueprintKey: mugId,
    title: 'Songbird Mug',
    tags: ['songbird mug'],
  });
  assert.equal(mug.provider, 'printify');
  assert.equal(mug.blueprint_id, 68);
  assert.equal(mug.print_provider_id, 26);

  const poster = generatePodPayload({
    provider: 'gelato',
    blueprintKey: posterId,
    title: 'Archival Poster',
    tags: ['archival poster'],
  });
  assert.equal(poster.provider, 'gelato');
  assert.equal(poster.apiVersion, 'v4');
  assert.ok(poster.variants[0].productUid.includes('18x24'));
});

test('MCP catalog exposes all 8 tools with canonical CLI module invocation & env vars', () => {
  assert.equal(ETSY_CONNECTOR_VERSION, '2.6.0');
  assert.equal(MCP_TOOLS.length, 8);
  assert.equal(TAXONOMY_CATALOG.length, 8);
  assert.deepEqual(
    TAXONOMY_CATALOG.map((t) => t.taxonomyId),
    [1099, 1098, 1085, 1095, 1089, 1077, 1065, 1092]
  );

  const bundle = buildMcpBundle({
    toolId: 'etsy_audit_listing_seo',
    argsText: JSON.stringify({ title: 'Test', tags: [] }),
    clientId: 'KEY123',
    shopId: 'me',
  });
  assert.equal(bundle.parseError, '');
  const srv = bundle.mcpConfigObj.mcpServers['etsy-connector'];
  assert.deepEqual(srv.args, ['-m', 'etsy_connector.cli', 'mcp']);
  assert.ok('ETSY_API_KEY' in srv.env);
  assert.ok('ETSY_ACCESS_TOKEN' in srv.env);
  assert.ok('ETSY_SHOP_ID' in srv.env);
  assert.ok(!bundle.stdioPipeCmd.includes('mcp_server.py'));
});

test('Quota planner computes QPD and QPS safely', () => {
  const q = analyzeQuota({ activeListingCount: 140, pollIntervalMin: 30, callsPerListing: 2, parallelWorkers: 4, dailyDrafts: 25 });
  assert.equal(q.totalDailyCalls, 6941);
  assert.equal(q.qpdSafe, true);
  assert.equal(q.qpsSafe, true);
});
