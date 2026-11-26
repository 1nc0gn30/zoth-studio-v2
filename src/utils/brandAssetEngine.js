/**
 * Zoth Studio Brand Assets & Alchemical Seals Engine (v2.3.0)
 *
 * Pure, zero-dependency, SSR-safe ES module usable in both browser UI and
 * Node.js test/API environments.
 *
 * Capabilities:
 *  - Strict input validation & XML/CSS/JSON escaping (zero raw injection)
 *  - 6 parametric SVG alchemical seals & cyber-sigils (standalone valid XML)
 *  - Canonical dual-theme design token catalog synced to src/theme.js & palette.js
 *  - Exact WCAG 2.1 relative luminance & contrast ratio evaluator
 *  - Production exporters: CSS custom properties, W3C Design Tokens JSON,
 *    Tailwind theme.extend.colors config, Attribution snippets, and browser SVG->PNG
 */

const HEX6_RE = /^#[0-9A-Fa-f]{6}$/;

/**
 * Strictly validates a 6-digit hex color (#RRGGBB). Rejects arbitrary CSS/TOML/XSS strings.
 */
export function sanitizeHex(value, fallback = '#D4AF37') {
  const safeFallback = typeof fallback === 'string' && HEX6_RE.test(fallback.trim())
    ? fallback.trim().toUpperCase()
    : '#D4AF37';
  if (typeof value !== 'string') return safeFallback;
  const trimmed = value.trim();
  if (!HEX6_RE.test(trimmed)) return safeFallback;
  return trimmed.toUpperCase();
}

/**
 * Strictly escapes XML special characters so arbitrary user strings can never
 * break SVG markup or inject attributes/elements.
 */
export function escapeXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strips ASCII control characters, collapses whitespace, and clamps length.
 */
export function sanitizeText(str, maxLen = 48) {
  const limit = Number.isFinite(Number(maxLen)) && Number(maxLen) > 0 ? Math.floor(Number(maxLen)) : 48;
  return String(str ?? '')
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit)
    .trim();
}

/**
 * Parses a validated #RRGGBB hex string into { r, g, b } in 0..255.
 */
export function hexToRgb(hex, fallback = '#D4AF37') {
  const clean = sanitizeHex(hex, fallback).slice(1);
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

/**
 * WCAG 2.1 relative luminance (0.0 for #000000, 1.0 for #FFFFFF).
 */
export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex, '#000000');
  const toLinear = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Exact WCAG 2.1 contrast ratio between two hex colors (1.00 .. 21.00).
 */
export function contrastRatio(hexA, hexB) {
  const l1 = relativeLuminance(hexA);
  const l2 = relativeLuminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * WCAG 2.1 conformance classification for a contrast ratio.
 */
export function wcagBadge(ratio) {
  const r = Number(ratio) || 0;
  if (r >= 7.0) return { level: 'AAA', passAA: true, passAAA: true, passLarge: true, label: 'AAA (≥ 7.0:1)' };
  if (r >= 4.5) return { level: 'AA', passAA: true, passAAA: false, passLarge: true, label: 'AA (≥ 4.5:1)' };
  if (r >= 3.0) return { level: 'AA Large', passAA: false, passAAA: false, passLarge: true, label: 'AA Large (≥ 3.0:1)' };
  return { level: 'FAIL', passAA: false, passAAA: false, passLarge: false, label: 'FAIL (< 3.0:1)' };
}

/**
 * 6 Parametric Alchemical Seal & Cyber-Sigil Templates
 */
export const BRAND_SEAL_TEMPLATES = Object.freeze([
  {
    id: 'ghostbyte-sanctum',
    name: 'GhostByte Sanctum Seal',
    category: 'Primary Emblem',
    description: 'Concentric geometric sanctum rings, 12-point astrolabe compass ticks, and central GhostByte diamond core.',
    defaultTitle: 'ZOTH STUDIO',
    defaultSubtitle: 'GHOSTBYTE SANCTUM · ZERO EGRESS',
    defaultPrimary: '#D4AF37',
    defaultSecondary: '#38BDF8',
  },
  {
    id: 'ouroboros-ring',
    name: 'Ouroboros Sovereign Ring',
    category: 'Alchemical Seal',
    description: 'Twin interlocked alchemical orbital rings, segmented scale ticks, and infinite loop axis glyph.',
    defaultTitle: 'OUROBOROS',
    defaultSubtitle: 'SOVEREIGN LOOPBACK · 127.0.0.1',
    defaultPrimary: '#D4AF37',
    defaultSecondary: '#F5E6AB',
  },
  {
    id: 'metatron-hex',
    name: 'Metatron Hexagram Lattice',
    category: 'Sacred Geometry',
    description: 'Six-node sacred geometry mesh with interlaced hexagram chords and harmonic vertex anchors.',
    defaultTitle: 'METATRON HEX',
    defaultSubtitle: 'BYZANTINE CONSENSUS · 2F+1',
    defaultPrimary: '#D4AF37',
    defaultSecondary: '#10B981',
  },
  {
    id: 'azoth-archon',
    name: 'Azoth Archon Crest',
    category: 'Alchemical Seal',
    description: 'Equilateral hermetic alembic triangle, orbital reticle crosshairs, and mercury crown.',
    defaultTitle: 'AZOTH ARCHON',
    defaultSubtitle: 'LOCAL ORCHESTRATOR · RING 0',
    defaultPrimary: '#D4AF37',
    defaultSecondary: '#38BDF8',
  },
  {
    id: 'zoth-monogram',
    name: 'Zoth Studio Sovereign Monogram',
    category: 'Brandmark',
    description: 'Angular sovereign Z emblem framed inside a double-chamfered architectural octagon.',
    defaultTitle: 'ZOTH STUDIO',
    defaultSubtitle: 'NEAL FRAZIER TECH · NULLAI',
    defaultPrimary: '#D4AF37',
    defaultSecondary: '#F5E6AB',
  },
  {
    id: 'cyber-sigil',
    name: 'NullAI Cyber-Sigil',
    category: 'Cyber-Sigil',
    description: 'Octagonal zero-egress circuit bus with radial PCB trace nodes and encrypted neural core.',
    defaultTitle: 'NULLAI CORE',
    defaultSubtitle: 'AIR-GAPPED ENCLAVE · v2.3.0',
    defaultPrimary: '#38BDF8',
    defaultSecondary: '#D4AF37',
  },
]);

/**
 * Canonical Dual-Theme Design Token Catalog
 * Directly synced to src/theme.js and src/components/sovereign/palette.js.
 */
export const BRAND_TOKENS = Object.freeze({
  version: '2.3.0',
  systemName: 'Zoth Studio Dual-Theme Design System',
  attribution: 'Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform',
  light: Object.freeze([
    { key: 'bg-ground', cssVar: '--zoth-light-ground', name: 'Editorial Ivory Ground', hex: '#FAF8F3', role: 'Primary Light Canvas (theme.js background.default)' },
    { key: 'bg-card', cssVar: '--zoth-light-card', name: 'Museum Vellum Card', hex: '#FFFFFF', role: 'Elevated Surface & Card Paper (theme.js background.paper)' },
    { key: 'bg-subtle', cssVar: '--zoth-light-subtle', name: 'Warm Stone Parchment', hex: '#F3EFE6', role: 'Footer & Code Surface Ground' },
    { key: 'ink-primary', cssVar: '--zoth-light-ink', name: 'Obsidian Ink Primary', hex: '#101828', role: 'Headlines & Body Copy (theme.js text.primary)' },
    { key: 'ink-secondary', cssVar: '--zoth-light-ink-muted', name: 'Editorial Slate Ink', hex: '#475467', role: 'Secondary Copy & Metadata (theme.js text.secondary)' },
    { key: 'accent-gold', cssVar: '--zoth-light-gold', name: 'Antique Bronze Gold', hex: '#7A5808', role: 'WCAG AA Light Mode Gold Accent (≥ 6.2:1 on Ivory)' },
    { key: 'border-hairline', cssVar: '--zoth-light-border', name: 'Warm Alabaster Hairline', hex: '#E6E1D6', role: 'Structural Dividers (theme.js divider)' },
    { key: 'accent-cyan', cssVar: '--zoth-light-cyan', name: 'Cerulean Ink', hex: '#0369A1', role: 'Light Mode Telemetry & Info Ink (--zs-sky)' },
    { key: 'accent-emerald', cssVar: '--zoth-light-emerald', name: 'Deep Viridian Ink', hex: '#047857', role: 'Light Mode Verified & Pass Status (--zs-emerald)' },
    { key: 'accent-crimson', cssVar: '--zoth-light-crimson', name: 'Carmine Rubric Ink', hex: '#B42318', role: 'Light Mode Security Alert & Fail Status' },
  ]),
  dark: Object.freeze([
    { key: 'bg-void', cssVar: '--zoth-dark-void', name: 'Void Core Ground', hex: '#08080B', role: 'Primary Dark Canvas (darkTheme background.default)' },
    { key: 'bg-paper', cssVar: '--zoth-dark-paper', name: 'Obsidian Paper', hex: '#0B0B12', role: 'Elevated Card Surface (darkTheme background.paper)' },
    { key: 'bg-elevated', cssVar: '--zoth-dark-elevated', name: 'Enclave Panel', hex: '#0A0D16', role: 'Workbench & Code Bezel (SOV.obsidian2)' },
    { key: 'ink-primary', cssVar: '--zoth-dark-ink', name: 'Luminous Alabaster Ink', hex: '#EDEFF2', role: 'Primary Dark Mode Copy (darkTheme text.primary)' },
    { key: 'ink-muted', cssVar: '--zoth-dark-ink-muted', name: 'Cool Pewter Ink', hex: '#98A2B3', role: 'Secondary Dark Mode Labels & Captions' },
    { key: 'accent-gold', cssVar: '--zoth-dark-gold', name: 'Sovereign Aurum Gold', hex: '#D4AF37', role: 'Primary Accent & Seal Foil (SOV.gold)' },
    { key: 'accent-champagne', cssVar: '--zoth-dark-champagne', name: 'Champagne Gold Foil', hex: '#F5E6AB', role: 'Subhead Highlight & Luminous Glyph Tint' },
    { key: 'accent-cyan', cssVar: '--zoth-dark-cyan', name: 'Neural Sky Cyan', hex: '#38BDF8', role: 'Dark Mode Telemetry & Zero-Egress Status (SOV.cyber)' },
    { key: 'accent-emerald', cssVar: '--zoth-dark-emerald', name: 'Sovereign Emerald', hex: '#10B981', role: 'Dark Mode Verified & Pass Status (--zs-emerald)' },
    { key: 'accent-crimson', cssVar: '--zoth-dark-crimson', name: 'Alert Crimson', hex: '#F43F5E', role: 'Dark Mode Hazard & High-Severity Status' },
  ]),
  typography: Object.freeze([
    {
      role: 'Display & Alchemical Headings',
      family: '"Celtic Garamond", Georgia, "Times New Roman", serif',
      cssVar: '--zoth-font-display',
      weights: '400 (Regular)',
      usage: 'H1–H6 headlines, workstation titles, and engraved seal inscriptions.',
      specimen: 'Sovereign Architecture · Zero-Egress Enclave',
    },
    {
      role: 'Editorial Body & UI Controls',
      family: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      cssVar: '--zoth-font-sans',
      weights: '400, 500, 600, 700, 800 (Self-Hosted WOFF2)',
      usage: 'Documentation prose, cards, forms, and interactive labels.',
      specimen: 'Local-first developer studio with Editorial Ivory and Obsidian Gold parity.',
    },
    {
      role: 'Telemetry, Code & Eyebrows',
      family: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
      cssVar: '--zoth-font-mono',
      weights: '400, 500, 600, 700, 800 (Self-Hosted WOFF2)',
      usage: 'Hex codes, CLI commands, eyebrows, badges, and JSON/CSS artifact inspectors.',
      specimen: '127.0.0.1:3000 · SHA-256 · WCAG AA ≥ 4.5:1',
    },
  ]),
  officialAssets: Object.freeze([
    {
      id: 'ghostbyte-light',
      name: 'GhostByte Emblem (Editorial Light)',
      path: '/brand/ghostbyte.png',
      format: 'PNG (RGBA)',
      dimensions: '512 × 512',
      themeVariant: 'light',
      alt: 'GhostByte sovereign brand emblem optimized for Editorial Ivory light surfaces',
      usage: 'Primary brandmark for Editorial Ivory (#FAF8F3) and crisp white (#FFFFFF) surfaces.',
    },
    {
      id: 'ghostbyte-dark',
      name: 'GhostByte Emblem (Obsidian Dark)',
      path: '/brand/ghostbyte-dark.png',
      format: 'PNG (RGBA)',
      dimensions: '512 × 512',
      themeVariant: 'dark',
      alt: 'GhostByte sovereign gold brand emblem optimized for Obsidian dark surfaces',
      usage: 'Primary brandmark for Obsidian Void (#08080B) dark headers, favicons, and CLI banners.',
    },
    {
      id: 'antigravity-mascot',
      name: 'Antigravity Architect Mascot',
      path: '/mascot/antigravity.jpg',
      format: 'JPEG (JFIF)',
      dimensions: '1024 × 1024',
      themeVariant: 'dark',
      alt: 'Antigravity autonomous architect mascot portrait in obsidian and gold',
      usage: 'Agent avatar, release notes header, and autonomous engineering spotlight.',
    },
    {
      id: 'lucy-oracle',
      name: 'Lucy Netrunner Oracle Portrait',
      path: '/assets/lucy.png',
      format: 'PNG (RGBA)',
      dimensions: '600 × 800',
      themeVariant: 'dark',
      alt: 'Lucy Netrunner Oracle portrait for the STDP Neuro-Memory Hub',
      usage: 'Neuro-Memory Hub (:8094) guardian emblem and documentation companion artwork.',
    },
    {
      id: 'og-banner',
      name: 'Zoth Studio Social OpenGraph Banner',
      path: '/og-banner.jpg',
      format: 'JPEG (JFIF)',
      dimensions: '1200 × 624',
      themeVariant: 'dark',
      alt: 'Zoth Studio obsidian and gold geometric scepter OpenGraph social preview banner',
      usage: 'Canonical og:image & twitter:image share card across zoth.nullai.tech routes.',
    },
  ]),
});

/**
 * Evaluates canonical Light & Dark WCAG 2.1 contrast pairs from BRAND_TOKENS.
 */
export function evaluateTokenMatrix(tokens = BRAND_TOKENS) {
  const byKey = (list) => Object.fromEntries(list.map((t) => [t.key, t]));
  const L = byKey(tokens.light);
  const D = byKey(tokens.dark);

  const rawPairs = [
    { theme: 'light', label: 'Primary Ink on Ivory Ground', fg: L['ink-primary'], bg: L['bg-ground'] },
    { theme: 'light', label: 'Primary Ink on Vellum Card', fg: L['ink-primary'], bg: L['bg-card'] },
    { theme: 'light', label: 'Secondary Slate on Ivory Ground', fg: L['ink-secondary'], bg: L['bg-ground'] },
    { theme: 'light', label: 'Antique Gold Accent on Ivory Ground', fg: L['accent-gold'], bg: L['bg-ground'] },
    { theme: 'light', label: 'Cerulean Cyan Ink on Ivory Ground', fg: L['accent-cyan'], bg: L['bg-ground'] },
    { theme: 'light', label: 'Viridian Emerald Ink on Ivory Ground', fg: L['accent-emerald'], bg: L['bg-ground'] },
    { theme: 'light', label: 'Carmine Alert Ink on Ivory Ground', fg: L['accent-crimson'], bg: L['bg-ground'] },
    { theme: 'dark', label: 'Alabaster Ink on Void Ground', fg: D['ink-primary'], bg: D['bg-void'] },
    { theme: 'dark', label: 'Alabaster Ink on Obsidian Paper', fg: D['ink-primary'], bg: D['bg-paper'] },
    { theme: 'dark', label: 'Pewter Muted Ink on Void Ground', fg: D['ink-muted'], bg: D['bg-void'] },
    { theme: 'dark', label: 'Sovereign Gold on Void Ground', fg: D['accent-gold'], bg: D['bg-void'] },
    { theme: 'dark', label: 'Champagne Gold on Obsidian Paper', fg: D['accent-champagne'], bg: D['bg-paper'] },
    { theme: 'dark', label: 'Neural Cyan on Void Ground', fg: D['accent-cyan'], bg: D['bg-void'] },
    { theme: 'dark', label: 'Sovereign Emerald on Void Ground', fg: D['accent-emerald'], bg: D['bg-void'] },
    { theme: 'dark', label: 'Alert Crimson on Void Ground', fg: D['accent-crimson'], bg: D['bg-void'] },
  ];

  return rawPairs.map((p) => {
    const ratio = contrastRatio(p.fg.hex, p.bg.hex);
    const badge = wcagBadge(ratio);
    return {
      theme: p.theme,
      label: p.label,
      fgName: p.fg.name,
      fgHex: p.fg.hex,
      bgName: p.bg.name,
      bgHex: p.bg.hex,
      ratio,
      ...badge,
    };
  });
}

function clampInt(val, min, max, fallback) {
  const n = Math.round(Number(val));
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function clampFloat(val, min, max, fallback) {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Number(Math.max(min, Math.min(max, n)).toFixed(2));
}

function polarPoint(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [Number((cx + r * Math.cos(rad)).toFixed(2)), Number((cy + r * Math.sin(rad)).toFixed(2))];
}

function polygonPoints(cx, cy, r, sides, rotationDeg = 0) {
  return Array.from({ length: sides }, (_, i) => {
    const [x, y] = polarPoint(cx, cy, r, rotationDeg + (360 / sides) * i);
    return `${x},${y}`;
  }).join(' ');
}

/**
 * Generates a clean, standalone, XML-escaped parametric SVG alchemical seal or cyber-sigil.
 */
export function generateSealSvg(options = {}) {
  const tpl = BRAND_SEAL_TEMPLATES.find((t) => t.id === options.templateId) || BRAND_SEAL_TEMPLATES[0];
  const title = sanitizeText(options.title !== undefined ? options.title : tpl.defaultTitle, 36) || tpl.defaultTitle;
  const subtitle = sanitizeText(options.subtitle !== undefined ? options.subtitle : tpl.defaultSubtitle, 48);
  const primaryHex = sanitizeHex(options.primaryHex, tpl.defaultPrimary);
  const secondaryHex = sanitizeHex(options.secondaryHex, tpl.defaultSecondary);
  const bgHex = sanitizeHex(options.bgHex, '#08080B');
  const rings = clampInt(options.rings, 1, 5, 3);
  const strokeWidth = clampFloat(options.strokeWidth, 1, 6, 2.5);
  const size = clampInt(options.size, 128, 2048, 512);
  const transparentBg = Boolean(options.transparentBg);

  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle);
  const safeTemplateName = escapeXml(tpl.name);
  const cx = 256;
  const cy = 256;

  // Concentric alchemical outer rings based on ring density (1..5)
  const ringRadii = [232, 212, 186, 158, 130].slice(0, rings);
  const concentricRingsSvg = ringRadii
    .map((r, idx) => {
      const dash = idx % 2 === 1 ? ' stroke-dasharray="6 6"' : '';
      const color = idx === 0 ? primaryHex : idx % 2 === 1 ? secondaryHex : primaryHex;
      const opacity = idx === 0 ? '0.95' : (0.78 - idx * 0.1).toFixed(2);
      const sw = idx === 0 ? strokeWidth : Math.max(1, Number((strokeWidth * 0.65).toFixed(2)));
      return `    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-opacity="${opacity}"${dash} />`;
    })
    .join('\n');

  // Compass degree ticks around outer bezel
  const tickCount = 24;
  const ticksSvg = Array.from({ length: tickCount }, (_, i) => {
    const angle = (360 / tickCount) * i;
    const isCardinal = i % 6 === 0;
    const [x1, y1] = polarPoint(cx, cy, isCardinal ? 214 : 222, angle);
    const [x2, y2] = polarPoint(cx, cy, 232, angle);
    return `    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${isCardinal ? primaryHex : secondaryHex}" stroke-width="${isCardinal ? strokeWidth : 1.2}" stroke-opacity="${isCardinal ? '0.95' : '0.55'}" />`;
  }).join('\n');

  // Template-specific central geometry
  let motifSvg = '';
  switch (tpl.id) {
    case 'ghostbyte-sanctum': {
      const outerDiamond = polygonPoints(cx, cy, 114, 4, 0);
      const innerDiamond = polygonPoints(cx, cy, 74, 4, 45);
      const nodes = [0, 90, 180, 270]
        .map((a) => {
          const [x, y] = polarPoint(cx, cy, 114, a);
          return `    <circle cx="${x}" cy="${y}" r="5.5" fill="${secondaryHex}" stroke="${primaryHex}" stroke-width="1.5" />`;
        })
        .join('\n');
      motifSvg = `
    <polygon points="${outerDiamond}" fill="none" stroke="${primaryHex}" stroke-width="${strokeWidth}" />
    <polygon points="${innerDiamond}" fill="none" stroke="${secondaryHex}" stroke-width="${(strokeWidth * 0.85).toFixed(2)}" stroke-opacity="0.9" />
    <path d="M 218 274 C 218 224 234 202 256 202 C 278 202 294 224 294 274 L 281 264 L 269 276 L 256 264 L 243 276 L 231 264 Z" fill="none" stroke="${primaryHex}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
    <circle cx="243" cy="238" r="5" fill="${secondaryHex}" />
    <circle cx="269" cy="238" r="5" fill="${secondaryHex}" />
    <line x1="256" y1="142" x2="256" y2="188" stroke="${primaryHex}" stroke-width="1.5" stroke-opacity="0.7" />
    <line x1="256" y1="324" x2="256" y2="370" stroke="${primaryHex}" stroke-width="1.5" stroke-opacity="0.7" />
${nodes}`;
      break;
    }
    case 'ouroboros-ring': {
      const scales = Array.from({ length: 16 }, (_, i) => {
        const angle = i * 22.5;
        const [x, y] = polarPoint(cx, cy, 108, angle);
        return `    <circle cx="${x}" cy="${y}" r="4" fill="none" stroke="${i % 2 === 0 ? primaryHex : secondaryHex}" stroke-width="1.5" />`;
      }).join('\n');
      motifSvg = `
    <circle cx="${cx}" cy="${cy}" r="116" fill="none" stroke="${primaryHex}" stroke-width="${(strokeWidth * 1.35).toFixed(2)}" />
    <circle cx="${cx}" cy="${cy}" r="96" fill="none" stroke="${secondaryHex}" stroke-width="${strokeWidth}" stroke-dasharray="14 6" />
    <path d="M 196 256 C 196 218 232 218 256 256 C 280 294 316 294 316 256 C 316 218 280 218 256 256 C 232 294 196 294 196 256 Z" fill="none" stroke="${primaryHex}" stroke-width="${(strokeWidth * 1.1).toFixed(2)}" />
    <circle cx="222" cy="256" r="6" fill="${secondaryHex}" />
    <circle cx="290" cy="256" r="6" fill="${secondaryHex}" />
${scales}`;
      break;
    }
    case 'metatron-hex': {
      const hexPts = Array.from({ length: 6 }, (_, i) => polarPoint(cx, cy, 112, i * 60));
      const triA = [hexPts[0], hexPts[2], hexPts[4]].map((p) => p.join(',')).join(' ');
      const triB = [hexPts[1], hexPts[3], hexPts[5]].map((p) => p.join(',')).join(' ');
      const chords = [];
      for (let i = 0; i < 6; i += 1) {
        for (let j = i + 1; j < 6; j += 1) {
          chords.push(
            `    <line x1="${hexPts[i][0]}" y1="${hexPts[i][1]}" x2="${hexPts[j][0]}" y2="${hexPts[j][1]}" stroke="${secondaryHex}" stroke-width="1.15" stroke-opacity="0.58" />`
          );
        }
      }
      const vertexCircles = hexPts
        .map(([x, y]) => `    <circle cx="${x}" cy="${y}" r="16" fill="none" stroke="${primaryHex}" stroke-width="${(strokeWidth * 0.75).toFixed(2)}" />`)
        .join('\n');
      motifSvg = `
${chords.join('\n')}
    <polygon points="${triA}" fill="none" stroke="${primaryHex}" stroke-width="${strokeWidth}" />
    <polygon points="${triB}" fill="none" stroke="${primaryHex}" stroke-width="${strokeWidth}" />
    <circle cx="${cx}" cy="${cy}" r="24" fill="none" stroke="${secondaryHex}" stroke-width="${strokeWidth}" />
    <circle cx="${cx}" cy="${cy}" r="6" fill="${primaryHex}" />
${vertexCircles}`;
      break;
    }
    case 'azoth-archon': {
      const upTri = polygonPoints(cx, cy + 10, 112, 3, 0);
      const downTri = polygonPoints(cx, cy - 10, 62, 3, 180);
      motifSvg = `
    <polygon points="${upTri}" fill="none" stroke="${primaryHex}" stroke-width="${(strokeWidth * 1.15).toFixed(2)}" stroke-linejoin="miter" />
    <polygon points="${downTri}" fill="none" stroke="${secondaryHex}" stroke-width="${strokeWidth}" />
    <circle cx="${cx}" cy="242" r="26" fill="none" stroke="${primaryHex}" stroke-width="${strokeWidth}" />
    <path d="M 232 204 C 244 218 268 218 280 204" fill="none" stroke="${secondaryHex}" stroke-width="${strokeWidth}" stroke-linecap="round" />
    <line x1="256" y1="268" x2="256" y2="314" stroke="${primaryHex}" stroke-width="${strokeWidth}" />
    <line x1="234" y1="292" x2="278" y2="292" stroke="${primaryHex}" stroke-width="${strokeWidth}" />
    <circle cx="${cx}" cy="242" r="6" fill="${secondaryHex}" />`;
      break;
    }
    case 'zoth-monogram': {
      const octOuter = polygonPoints(cx, cy, 122, 8, 22.5);
      const octInner = polygonPoints(cx, cy, 104, 8, 22.5);
      motifSvg = `
    <polygon points="${octOuter}" fill="none" stroke="${primaryHex}" stroke-width="${strokeWidth}" />
    <polygon points="${octInner}" fill="none" stroke="${secondaryHex}" stroke-width="${(strokeWidth * 0.7).toFixed(2)}" stroke-opacity="0.8" />
    <path d="M 204 202 L 308 202 L 210 310 L 308 310" fill="none" stroke="${primaryHex}" stroke-width="${(strokeWidth * 2.2).toFixed(2)}" stroke-linecap="square" stroke-linejoin="miter" />
    <line x1="226" y1="256" x2="286" y2="256" stroke="${secondaryHex}" stroke-width="${strokeWidth}" />`;
      break;
    }
    case 'cyber-sigil':
    default: {
      const oct = polygonPoints(cx, cy, 118, 8, 22.5);
      const spokes = Array.from({ length: 8 }, (_, i) => {
        const angle = i * 45;
        const [x1, y1] = polarPoint(cx, cy, 46, angle);
        const [x2, y2] = polarPoint(cx, cy, 98, angle);
        return `    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${i % 2 === 0 ? primaryHex : secondaryHex}" stroke-width="1.8" />
    <circle cx="${x2}" cy="${y2}" r="4.5" fill="${i % 2 === 0 ? secondaryHex : primaryHex}" />`;
      }).join('\n');
      motifSvg = `
    <polygon points="${oct}" fill="none" stroke="${primaryHex}" stroke-width="${strokeWidth}" />
    <rect x="218" y="218" width="76" height="76" rx="8" fill="none" stroke="${secondaryHex}" stroke-width="${strokeWidth}" />
    <rect x="234" y="234" width="44" height="44" rx="4" fill="none" stroke="${primaryHex}" stroke-width="${strokeWidth}" />
    <circle cx="${cx}" cy="${cy}" r="9" fill="${primaryHex}" />
${spokes}`;
      break;
    }
  }

  const bgRect = transparentBg
    ? ''
    : `  <rect width="512" height="512" rx="32" fill="${bgHex}" />\n`;

  const subtitleNode = safeSubtitle
    ? `  <text x="256" y="458" text-anchor="middle" fill="${secondaryHex}" font-family="JetBrains Mono, IBM Plex Mono, ui-monospace, monospace" font-size="13" font-weight="700" letter-spacing="3.2">${safeSubtitle}</text>\n`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}" role="img" aria-label="${safeTitle} — ${safeTemplateName}">
  <title>${safeTitle} — ${safeTemplateName}</title>
  <desc>Parametric Zoth Studio vector seal (${safeTemplateName}) generated client-side by brandAssetEngine v2.3.0.</desc>
${bgRect}  <g id="seal-bezel">
${concentricRingsSvg}
${ticksSvg}
  </g>
  <g id="seal-motif">${motifSvg}
  </g>
  <text x="256" y="72" text-anchor="middle" fill="${primaryHex}" font-family="Celtic Garamond, Georgia, serif" font-size="22" font-weight="600" letter-spacing="5.5">${safeTitle}</text>
${subtitleNode}</svg>`;
}

/**
 * Exports clean dual-theme CSS custom properties (:root + [data-theme="dark"]).
 */
export function exportCssVariables(tokens = BRAND_TOKENS) {
  const lightLines = tokens.light.map((t) => `  ${t.cssVar}: ${t.hex}; /* ${t.name} */`).join('\n');
  const darkLines = tokens.dark.map((t) => `  ${t.cssVar}: ${t.hex}; /* ${t.name} */`).join('\n');
  const fontLines = tokens.typography.map((f) => `  ${f.cssVar}: ${f.family};`).join('\n');

  return `/* ${tokens.systemName} (v${tokens.version})
 * ${tokens.attribution}
 */

:root,
[data-theme="light"] {
  /* Editorial Ivory Light Tokens */
${lightLines}

  /* Semantic Aliases (Light Default) */
  --zoth-bg-ground: #FAF8F3;
  --zoth-bg-card: #FFFFFF;
  --zoth-ink-primary: #101828;
  --zoth-ink-secondary: #475467;
  --zoth-accent-gold: #7A5808;
  --zoth-border-hairline: #E6E1D6;

  /* Typography Stack */
${fontLines}
}

[data-theme="dark"] {
  /* Obsidian Gold Dark Tokens */
${darkLines}

  /* Semantic Aliases (Dark Mode) */
  --zoth-bg-ground: #08080B;
  --zoth-bg-card: #0B0B12;
  --zoth-ink-primary: #EDEFF2;
  --zoth-ink-secondary: #98A2B3;
  --zoth-accent-gold: #D4AF37;
  --zoth-border-hairline: #26262F;
}
`;
}

/**
 * Exports W3C Design Tokens Community Group JSON format.
 */
export function exportTokensJson(tokens = BRAND_TOKENS) {
  const toGroup = (list) =>
    Object.fromEntries(
      list.map((t) => [
        t.key,
        {
          $type: 'color',
          $value: t.hex,
          $description: `${t.name} — ${t.role}`,
        },
      ])
    );

  const payload = {
    $schema: 'https://tr.designtokens.org/format/',
    $metadata: {
      name: tokens.systemName,
      version: tokens.version,
      attribution: tokens.attribution,
    },
    color: {
      light: toGroup(tokens.light),
      dark: toGroup(tokens.dark),
    },
    fontFamily: Object.fromEntries(
      tokens.typography.map((f) => [
        f.cssVar.replace(/^--zoth-font-/, ''),
        {
          $type: 'fontFamily',
          $value: f.family,
          $description: f.usage,
        },
      ])
    ),
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Exports a drop-in Tailwind CSS theme.extend configuration module.
 */
export function exportTailwindConfig(tokens = BRAND_TOKENS) {
  const lightEntries = tokens.light.map((t) => `          '${t.key}': '${t.hex}',`).join('\n');
  const darkEntries = tokens.dark.map((t) => `          '${t.key}': '${t.hex}',`).join('\n');

  return `// ${tokens.systemName} (v${tokens.version}) — Tailwind CSS Preset
// ${tokens.attribution}
export default {
  theme: {
    extend: {
      colors: {
        zothLight: {
${lightEntries}
        },
        zothDark: {
${darkEntries}
        },
      },
      fontFamily: {
        display: ['"Celtic Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
      },
    },
  },
};
`;
}

/**
 * Returns clean, compliant HTML, Markdown, and inline SVG attribution snippets.
 */
export function exportBrandAttributionSnippets() {
  const text = BRAND_TOKENS.attribution;
  return {
    plainText: text,
    htmlFooter: `<footer class="zoth-attribution">
  <p>Engineered by <strong>Neal Frazier Tech</strong> (<a href="https://github.com/1nc0gn30" rel="noopener noreferrer">@1nc0gn30</a>) &bull; <a href="https://nullai.tech" rel="noopener noreferrer">NullAI Platform</a></p>
</footer>`,
    markdownFooter: `---
*Engineered by Neal Frazier Tech ([@1nc0gn30](https://github.com/1nc0gn30)) • [NullAI Platform](https://nullai.tech)*`,
    svgBadge: `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="32" viewBox="0 0 380 32" role="img" aria-label="${escapeXml(text)}">
  <title>${escapeXml(text)}</title>
  <rect width="380" height="32" rx="6" fill="#08080B" stroke="#D4AF37" stroke-width="1" />
  <text x="190" y="20" text-anchor="middle" fill="#EDEFF2" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600">${escapeXml(text)}</text>
</svg>`,
  };
}

/**
 * Browser-side helper that rasterizes a standalone SVG string to a PNG data URL.
 */
export function rasterizeSvgToPngDataUrl(svgString, size = 1024) {
  const px = clampInt(size, 128, 2048, 1024);
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      reject(new Error('SVG rasterization requires a browser DOM environment.'));
      return;
    }
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = px;
        canvas.height = px;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, px, px);
        const pngDataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(pngDataUrl);
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode generated SVG for PNG rasterization.'));
    };
    img.src = url;
  });
}

/**
 * Returns the machine-readable JSON manifest served by GET /api/studio/brand/tokens.
 */
export function getBrandApiManifest() {
  return {
    schemaVersion: BRAND_TOKENS.version,
    id: 'brand',
    name: 'Zoth Studio Brand Assets & Alchemical Seals Kit',
    attribution: BRAND_TOKENS.attribution,
    openAccess: true,
    zeroEgress: true,
    templates: BRAND_SEAL_TEMPLATES,
    tokens: {
      light: BRAND_TOKENS.light,
      dark: BRAND_TOKENS.dark,
    },
    typography: BRAND_TOKENS.typography,
    officialAssets: BRAND_TOKENS.officialAssets,
    wcagMatrix: evaluateTokenMatrix(BRAND_TOKENS),
  };
}
