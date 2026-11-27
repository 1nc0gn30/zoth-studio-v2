import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ENGINE_VERSION,
  PRINT_RATIOS,
  computePackData,
  estimateJpegMb,
  generateEtsyListing,
} from '../src/utils/digitalAssetForgeEngine.js';

test('digitalAssetForgeEngine default 300 DPI Q92 pack aligns with Python backend (36.1 MB, 2 ZIPs, PASS)', () => {
  assert.equal(ENGINE_VERSION, '2.6.0');
  assert.equal(PRINT_RATIOS.length, 5);

  const pack = computePackData({ targetDpi: 300, jpegQuality: 92, retailPrice: 11.99, monthlySales: 180 });
  assert.equal(pack.matrix.length, 5);
  assert.equal(pack.matrix[0].estJpegMbNum, 11.9);
  assert.equal(pack.totalJpegMb, 36.1);
  assert.equal(pack.zipBundles.length, 2);
  assert.equal(pack.etsyCompliant, true);
  for (const z of pack.zipBundles) {
    assert.equal(z.status, 'PASS');
    assert.ok(z.totalMbNum <= 20.0, `ZIP exceeded 20MB: ${z.totalMbNum}`);
  }
  assert.ok(pack.etsyNetMarginPct > 85);
});

test('estimateJpegMb scales cleanly with quality', () => {
  const q92 = estimateJpegMb(7200, 10800, 92);
  const q80 = estimateJpegMb(7200, 10800, 80);
  const q98 = estimateJpegMb(7200, 10800, 98);
  assert.equal(q92, 11.9);
  assert.ok(q80 < q92);
  assert.ok(q98 > q92);
});

test('generateEtsyListing returns 13 <=20 char tags and title <=140 chars across all niches', () => {
  for (const niche of ['abstract', 'botanical', 'landscape', 'geometric']) {
    const listing = generateEtsyListing({
      artworkTitle: 'Mid-Century Terracotta Arch',
      niche,
      retailPriceUsd: 6.99,
    });
    assert.equal(listing.tagsCount, 13);
    assert.equal(listing.tags.length, 13);
    assert.ok(listing.titleCharCount <= 140);
    for (const tag of listing.tags) {
      assert.ok(tag.length > 0 && tag.length <= 20, `Invalid tag: ${tag}`);
    }
    assert.ok(listing.economics.profitMarginPercentage > 80);
  }
});
