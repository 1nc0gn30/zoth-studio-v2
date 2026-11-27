import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GELATO_CONNECTOR_VERSION,
  GELATO_PRODUCTS,
  LOCAL_HUBS,
  MCP_TOOLS,
  convertCurrency,
  validatePublicHttpsUrl,
  calculateRoutingAndEconomics,
  auditArtworkSpec,
  buildOrderV4Payload,
} from '../src/utils/gelatoConnectorEngine.js';

describe('gelatoConnectorEngine v2.6.0', () => {
  it('exposes 7 products with real Gelato v4 UIDs, 10 hubs, and 6 MCP tools', () => {
    assert.equal(GELATO_CONNECTOR_VERSION, '2.6.0');
    assert.equal(GELATO_PRODUCTS.length, 7);
    assert.equal(LOCAL_HUBS.length, 10);
    assert.equal(MCP_TOOLS.length, 6);
    for (const p of GELATO_PRODUCTS) {
      assert.ok(p.productUid && !p.productUid.startsWith('gelato_'), `Invalid productUid: ${p.productUid}`);
    }
  });

  it('converts JP shipping (650 JPY) into USD cleanly without negative margin explosion', () => {
    assert.equal(convertCurrency(650, 'JPY', 'USD'), 4.33);
    const res = calculateRoutingAndEconomics({
      productId: 'wooden_framed_canvas_16x24',
      countryCode: 'JP',
      currencyCode: 'USD',
      retailLocal: 68,
      vatIncluded: false,
      vatPct: 0,
      channelFeePct: 2.9,
    });
    assert.equal(res.isLocal, true);
    assert.equal(res.routing.localShipUsd, 4.33);
    assert.ok(res.routing.freightSavingsUsd > 10, 'Expected positive USD freight savings');
    assert.ok(res.economics.netProfitUsd > 30, `Expected positive USD profit, got ${res.economics.netProfitUsd}`);
    assert.ok(res.economics.netMarginPct > 45, `Expected realistic margin %, got ${res.economics.netMarginPct}`);
  });

  it('normalizes GB to UK hub and builds safe draft Order API v4 payloads', () => {
    const built = buildOrderV4Payload({
      productId: 'acrylic_print_16x24',
      countryCode: 'GB',
      currencyCode: 'GBP',
      artworkUrl: 'https://example.com/gallery-300dpi.png',
      artworkTitle: 'Gallery Piece',
    });
    assert.equal(built.urlValidation.valid, true);
    assert.equal(built.payload.orderType, 'draft');
    assert.equal(built.payload.shippingAddress.country, 'GB');
    assert.equal(built.payload.items[0].title, 'Gallery Piece');
    assert.ok(!built.payload.items[0].productUid.startsWith('gelato_'));
  });

  it('blocks file://, http://, localhost, and IMDS SSRF URLs', () => {
    for (const bad of [
      'file:///etc/passwd',
      'http://example.com/art.png',
      'https://127.0.0.1/art.png',
      'https://localhost/art.png',
      'http://169.254.169.254/latest/meta-data/',
      'https://169.254.169.254/latest/meta-data/',
      'https://10.0.0.5/art.png',
      'https://192.168.1.2/art.png',
    ]) {
      assert.equal(validatePublicHttpsUrl(bad).valid, false, `Should reject ${bad}`);
    }
    assert.equal(validatePublicHttpsUrl('https://cdn.example.com/art.png').valid, true);
  });

  it('marks 0mm DTG organic tee bleed compliant and rejects zero dimensions', () => {
    const tee = auditArtworkSpec('stanley_stella_organic_tee', 4000, 4800);
    assert.equal(tee.grade, 'EXCELLENT');
    assert.equal(tee.bleedCompliance, true);
    assert.match(tee.bleedNote, /No bleed required for DTG apparel/);

    assert.throws(() => auditArtworkSpec('acrylic_print_16x24', 4800, 0), /positive integers/);
  });
});
