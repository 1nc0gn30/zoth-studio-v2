#!/usr/bin/env node
/**
 * Unit & Parity Test Suite for Zoth Studio Brand Assets & Alchemical Seals Engine
 * Run: node --test scripts/test-brand-engine.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import {
  BRAND_SEAL_TEMPLATES,
  BRAND_TOKENS,
  contrastRatio,
  escapeXml,
  evaluateTokenMatrix,
  exportBrandAttributionSnippets,
  exportCssVariables,
  exportTailwindConfig,
  exportTokensJson,
  generateSealSvg,
  getBrandApiManifest,
  relativeLuminance,
  sanitizeHex,
  sanitizeText,
  wcagBadge,
} from '../src/utils/brandAssetEngine.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

test('src/utils/brandAssetEngine.js and server/brand-asset-engine.mjs stay byte-identical', () => {
  const srcBuf = fs.readFileSync(path.join(root, 'src/utils/brandAssetEngine.js'));
  const srvBuf = fs.readFileSync(path.join(root, 'server/brand-asset-engine.mjs'));
  assert.equal(sha256(srcBuf), sha256(srvBuf));
});

test('all 6 parametric SVG alchemical seals generate valid standalone XML with role and title', () => {
  assert.equal(BRAND_SEAL_TEMPLATES.length, 6);
  for (const tpl of BRAND_SEAL_TEMPLATES) {
    const svg = generateSealSvg({
      templateId: tpl.id,
      title: tpl.defaultTitle,
      subtitle: tpl.defaultSubtitle,
      primaryHex: tpl.defaultPrimary,
      secondaryHex: tpl.defaultSecondary,
      bgHex: '#08080B',
      rings: 4,
      strokeWidth: 2.5,
      size: 512,
      transparentBg: false,
    });
    assert.ok(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"'), `${tpl.id} header`);
    assert.ok(svg.endsWith('</svg>'), `${tpl.id} closing tag`);
    assert.match(svg, /role="img"/, `${tpl.id} role=img`);
    assert.match(svg, /<title>[^<]+<\/title>/, `${tpl.id} title`);
    assert.match(svg, /id="seal-bezel"/, `${tpl.id} bezel`);
    assert.match(svg, /id="seal-motif"/, `${tpl.id} motif`);
  }
});

test('XSS / XML injection payloads are strictly escaped in SVG output with zero raw tags or quotes', () => {
  const payload = '"><img src=x onerror=alert(1)>&\'<script>';
  const svg = generateSealSvg({
    templateId: 'ghostbyte-sanctum',
    title: payload,
    subtitle: payload,
    primaryHex: '"><script>alert(1)</script>',
    secondaryHex: 'red; background:url(javascript:alert(1))',
    bgHex: '#GGGGGG',
  });
  assert.equal(svg.includes('<img'), false, 'raw <img tag must never appear');
  assert.equal(svg.includes('<script'), false, 'raw <script tag must never appear');
  assert.equal(svg.includes('onerror='), true, 'escaped text content preserved safely');
  assert.ok(svg.includes('&quot;&gt;&lt;img'), 'XML entities strictly escaped');
  assert.ok(svg.includes('#D4AF37'), 'invalid primaryHex fell back to canonical gold');
  assert.ok(svg.includes('#08080B'), 'invalid bgHex fell back to obsidian void');
});

test('sanitizeHex, escapeXml, and sanitizeText enforce strict invariants', () => {
  assert.equal(sanitizeHex('#d4af37'), '#D4AF37');
  assert.equal(sanitizeHex(' #0369a1 '), '#0369A1');
  assert.equal(sanitizeHex('#FFF', '#101828'), '#101828');
  assert.equal(sanitizeHex('javascript:alert(1)', '#7A5808'), '#7A5808');
  assert.equal(sanitizeHex('"><img src=x>', '#08080B'), '#08080B');
  assert.equal(escapeXml(`<&>"'`), '&lt;&amp;&gt;&quot;&#39;');
  assert.equal(sanitizeText('Hello\x00\x07  World\nTest', 12), 'Hello World');
});

test('canonical dual-theme token catalog matches src/theme.js ground truth', () => {
  const themeSrc = fs.readFileSync(path.join(root, 'src/theme.js'), 'utf8');
  const lightByKey = Object.fromEntries(BRAND_TOKENS.light.map((t) => [t.key, t.hex]));
  const darkByKey = Object.fromEntries(BRAND_TOKENS.dark.map((t) => [t.key, t.hex]));

  assert.equal(lightByKey['bg-ground'], '#FAF8F3');
  assert.equal(lightByKey['bg-card'], '#FFFFFF');
  assert.equal(lightByKey['ink-primary'], '#101828');
  assert.equal(lightByKey['ink-secondary'], '#475467');
  assert.equal(lightByKey['border-hairline'], '#E6E1D6');
  assert.equal(darkByKey['bg-void'], '#08080B');
  assert.equal(darkByKey['bg-paper'], '#0B0B12');
  assert.equal(darkByKey['ink-primary'], '#EDEFF2');
  assert.equal(darkByKey['accent-gold'], '#D4AF37');

  for (const hex of ['#FAF8F3', '#FFFFFF', '#101828', '#475467', '#E6E1D6', '#08080B', '#0B0B12', '#EDEFF2', '#D4AF37']) {
    assert.ok(themeSrc.includes(hex), `src/theme.js must include canonical token ${hex}`);
  }
});

test('WCAG 2.1 contrast math is exact and all canonical Light & Dark token pairs pass AA (>= 4.5:1)', () => {
  assert.equal(relativeLuminance('#000000'), 0);
  assert.equal(relativeLuminance('#FFFFFF'), 1);
  assert.equal(contrastRatio('#000000', '#FFFFFF'), 21);
  assert.equal(contrastRatio('#FFFFFF', '#FFFFFF'), 1);
  assert.equal(wcagBadge(7.5).level, 'AAA');
  assert.equal(wcagBadge(4.6).level, 'AA');
  assert.equal(wcagBadge(3.2).level, 'AA Large');
  assert.equal(wcagBadge(2.1).level, 'FAIL');

  const matrix = evaluateTokenMatrix(BRAND_TOKENS);
  assert.ok(matrix.length >= 14, 'matrix covers light and dark pairs');
  for (const row of matrix) {
    assert.ok(
      row.ratio >= 4.5 && row.passAA,
      `${row.theme} "${row.label}" (${row.fgHex} on ${row.bgHex}) failed WCAG AA: ${row.ratio}:1`
    );
  }
});

test('CSS, W3C JSON, Tailwind, Attribution, and API manifest exporters produce valid artifacts', () => {
  const css = exportCssVariables(BRAND_TOKENS);
  assert.ok(css.includes(':root,'));
  assert.ok(css.includes('[data-theme="dark"]'));
  assert.ok(css.includes('--zoth-light-ground: #FAF8F3;'));
  assert.ok(css.includes('--zoth-dark-gold: #D4AF37;'));

  const jsonStr = exportTokensJson(BRAND_TOKENS);
  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.color.light['bg-ground'].$value, '#FAF8F3');
  assert.equal(parsed.color.dark['bg-void'].$value, '#08080B');

  const tw = exportTailwindConfig(BRAND_TOKENS);
  assert.ok(tw.includes('zothLight:'));
  assert.ok(tw.includes('zothDark:'));
  assert.ok(tw.includes('Celtic Garamond'));

  const attr = exportBrandAttributionSnippets();
  assert.equal(attr.plainText, 'Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform');
  assert.ok(attr.svgBadge.startsWith('<svg ') && attr.svgBadge.endsWith('</svg>'));

  const manifest = getBrandApiManifest();
  assert.equal(manifest.id, 'brand');
  assert.equal(manifest.openAccess, true);
  assert.equal(manifest.templates.length, 6);
  assert.equal(manifest.officialAssets.length, 5);
});
