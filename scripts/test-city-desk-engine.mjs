import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CITY_DESK_VERSION,
  CANONICAL_TRADES,
  CANONICAL_CITIES,
  escapeHtml,
  safeJsonLdString,
  calculateWrittenQuote,
  buildPreviewPath,
  synthesizeStandaloneHtml,
  buildOffersManifest,
  exportOffersCsv,
} from '../src/lib/cityDeskEngine.js';

test('canonical catalog has exact 20 trades x 50 cities = 1,000 offers', () => {
  assert.equal(CITY_DESK_VERSION, '2.6.0');
  assert.equal(CANONICAL_TRADES.length, 20);
  assert.equal(CANONICAL_CITIES.length, 50);
  const offers = buildOffersManifest();
  assert.equal(offers.length, 1000);
  assert.ok(CANONICAL_TRADES.some((t) => t.slug === 'dentists' && t.price === 1500));
  assert.ok(CANONICAL_TRADES.some((t) => t.slug === 'auto-repair' && t.price === 1000));
  assert.ok(!CANONICAL_TRADES.some((t) => t.slug === 'carpenters'));
});

test('escapeHtml and safeJsonLdString block XSS and script breakouts', () => {
  assert.equal(escapeHtml('A & B <script>"x\''), 'A &amp; B &lt;script&gt;&quot;x&#39;');
  const ld = safeJsonLdString({ name: '</script><script>alert(1)</script>' });
  assert.ok(!ld.includes('</script>'));
  assert.ok(ld.includes('\\u003c/script>'));
});

test('synthesizeStandaloneHtml escapes user inputs and contains zero personal phone PII', () => {
  const html = synthesizeStandaloneHtml({
    tradeSlug: 'dentists',
    citySlug: 'norfolk-va',
    biz: 'Bay & <script>alert(1)</script> Dental',
    phone: '',
    email: 'office@example.test',
  });
  assert.ok(html.includes('Bay &amp; &lt;script&gt;alert(1)&lt;/script&gt; Dental'));
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(!/948[^0-9]?204/.test(html));
  assert.ok(html.includes('Norfolk, VA'));
});

test('calculateWrittenQuote and buildPreviewPath work deterministically', () => {
  const q = calculateWrittenQuote('hvac', 1, 1.35);
  assert.ok(q.low > 0 && q.high > q.low);
  assert.match(q.formatted, /^\$[\d,]+ – \$[\d,]+$/);

  const path = buildPreviewPath('boise-id', 'painters', { biz: 'Apex & Sons', phone: '555-0100' });
  assert.equal(path, '/cities/boise-id/painters/?biz=Apex+%26+Sons&phone=555-0100');
});

test('exportOffersCsv produces 1,001 lines (header + 1,000 rows)', () => {
  const csv = exportOffersCsv();
  const lines = csv.trim().split('\n');
  assert.equal(lines.length, 1001);
  assert.ok(lines[0].startsWith('city,state,city_slug,service'));
});
