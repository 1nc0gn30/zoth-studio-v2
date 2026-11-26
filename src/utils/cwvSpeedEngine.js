/**
 * Pure, testable Core Web Vitals engine for Zoth Studio v2 (/tools/cwv-speed-engine).
 * Implements mobile/desktop HTML CWV auditing (LCP, CLS, INP, FCP, TTFB),
 * <head>-scoped defer HTML transformation, real Baseline vs Candidate Diff comparison,
 * W3C Speculation Rules synthesis, Performance Budget + LoAF checks, and bundle exports.
 */

export const CWV_VERSION = '2.6.0';

export const DEFAULT_SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Enterprise SaaS Telemetry Landing</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter:400,700">
  <link rel="stylesheet" href="/assets/vendor-bundle.css">
  <script src="https://cdn.example.com/analytics-heavy.js"></script>
  <script src="/assets/app-main.js"></script>
</head>
<body>
  <header class="hero">
    <nav>
      <a href="/docs">Docs</a>
      <a href="/features">Features</a>
      <a href="/pricing">Pricing</a>
      <a href="/checkout">Checkout</a>
      <a href="/logout">Logout</a>
    </nav>
    <img src="/assets/hero-dashboard-4k.png" alt="Hero Dashboard">
    <h1>Autonomous Cloud Telemetry Console</h1>
  </header>
  <section class="gallery">
    <img src="/assets/feature-1.png" alt="Feature 1">
    <img src="/assets/feature-2.png" alt="Feature 2">
  </section>
</body>
</html>`;

export function escapeAttr(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function rateMetric(metric, value) {
  const v = Number(value);
  if (metric === 'lcp') return v <= 2.5 ? 'GOOD' : v <= 4.0 ? 'NEEDS_IMPROVEMENT' : 'POOR';
  if (metric === 'cls') return v <= 0.1 ? 'GOOD' : v <= 0.25 ? 'NEEDS_IMPROVEMENT' : 'POOR';
  if (metric === 'inp') return v <= 200 ? 'GOOD' : v <= 500 ? 'NEEDS_IMPROVEMENT' : 'POOR';
  if (metric === 'fcp') return v <= 1.8 ? 'GOOD' : v <= 3.0 ? 'NEEDS_IMPROVEMENT' : 'POOR';
  if (metric === 'ttfb') return v <= 800 ? 'GOOD' : v <= 1800 ? 'NEEDS_IMPROVEMENT' : 'POOR';
  return 'GOOD';
}

function extractHead(html) {
  const m = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(html || '');
  return m ? m[1] : '';
}

export function auditHtml(html, device = 'mobile') {
  const dev = String(device || 'mobile').toLowerCase() === 'desktop' ? 'desktop' : 'mobile';
  const raw = String(html || '');
  if (!raw.trim()) {
    return {
      score: 0,
      rating: 'POOR',
      device: dev,
      metrics: {
        lcp: { value: 5.0, unit: 's', rating: 'POOR', target: '≤ 2.5s' },
        cls: { value: 0.35, unit: '', rating: 'POOR', target: '≤ 0.10' },
        inp: { value: 450, unit: 'ms', rating: 'POOR', target: '≤ 200ms' },
        fcp: { value: 3.2, unit: 's', rating: 'POOR', target: '≤ 1.8s' },
        ttfb: { value: 1200, unit: 'ms', rating: 'POOR', target: '≤ 800ms' },
      },
      issues: [],
    };
  }

  const head = extractHead(raw);
  const headScripts = [...head.matchAll(/<script\b([^>]*)>/gi)];
  const blockingScripts = headScripts.filter(
    (m) => /\bsrc\s*=/i.test(m[1]) && !/\b(defer|async)\b/i.test(m[1]) && !/type\s*=\s*["']?module/i.test(m[1]),
  );

  const imgMatches = [...raw.matchAll(/<img\b([^>]*)>/gi)];
  const missingDims = imgMatches.filter((m) => !/\bwidth\s*=/i.test(m[1]) || !/\bheight\s*=/i.test(m[1]));
  const missingLazy = imgMatches.slice(1).filter((m) => !/\bloading\s*=\s*["']?lazy/i.test(m[1]));
  const heroMissingPriority = imgMatches.length > 0 && !/\bfetchpriority\s*=\s*["']?high/i.test(imgMatches[0][1]);

  const stylesheets = [...raw.matchAll(/<link\b[^>]*rel=["'][^"']*stylesheet[^"']*["'][^>]*>/gi)];
  const fontLinks = [...raw.matchAll(/<link\b[^>]*fonts\.googleapis\.com[^>]*>/gi)];
  const missingDisplaySwap = fontLinks.filter((m) => !/display=swap/i.test(m[0]));
  const hasFontPreconnect = /<link\b[^>]*rel=["']preconnect["'][^>]*fonts\./i.test(raw);
  const hasViewport = /<meta\b[^>]*name\s*=\s*["']?viewport/i.test(raw);

  const issues = [];
  if (blockingScripts.length > 0) {
    issues.push({
      id: 'render-blocking-scripts',
      severity: blockingScripts.length > 1 ? 'CRITICAL' : 'WARNING',
      metric: 'LCP / FCP / INP',
      title: `${blockingScripts.length} Render-Blocking <script> Tag(s) in <head>`,
      fix: 'Add defer or type="module" to <head> scripts to unblock HTML parsing.',
    });
  }
  if (missingDims.length > 0) {
    issues.push({
      id: 'unsized-images',
      severity: missingDims.length > 2 ? 'CRITICAL' : 'WARNING',
      metric: 'CLS',
      title: `${missingDims.length} <img> Element(s) Missing width/height`,
      fix: 'Inject explicit width and height attributes to reserve layout boxes.',
    });
  }
  if (heroMissingPriority) {
    issues.push({
      id: 'hero-fetchpriority',
      severity: 'WARNING',
      metric: 'LCP',
      title: 'Above-the-Fold Hero Image Missing fetchpriority="high"',
      fix: 'Add fetchpriority="high" and <link rel="preload" as="image"> in <head>.',
    });
  }
  if (missingLazy.length > 0) {
    issues.push({
      id: 'unlazy-images',
      severity: 'WARNING',
      metric: 'LCP / Bandwidth',
      title: `${missingLazy.length} Below-the-Fold Image(s) Eagerly Loaded`,
      fix: 'Add loading="lazy" decoding="async" to offscreen images.',
    });
  }
  if (missingDisplaySwap.length > 0) {
    issues.push({
      id: 'font-display-swap',
      severity: 'WARNING',
      metric: 'CLS / FCP',
      title: 'Google Fonts Stylesheet Missing &display=swap',
      fix: 'Append &display=swap to prevent Flash of Invisible Text (FOIT).',
    });
  }
  if (fontLinks.length > 0 && !hasFontPreconnect) {
    issues.push({
      id: 'missing-font-preconnect',
      severity: 'WARNING',
      metric: 'LCP / FCP',
      title: 'External Font Origin Missing <link rel="preconnect">',
      fix: 'Add preconnect links for fonts.googleapis.com and fonts.gstatic.com.',
    });
  }
  if (!hasViewport) {
    issues.push({
      id: 'missing-viewport',
      severity: 'WARNING',
      metric: 'CLS / Mobile',
      title: 'Missing Responsive <meta name="viewport"> Tag',
      fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> in <head>.',
    });
  }

  const isMobile = dev === 'mobile';
  const mult = isMobile ? 1.35 : 0.95;
  const ttfb = Math.round((isMobile ? 210 : 115) + (fontLinks.length > 0 && !hasFontPreconnect ? 40 : 0));

  let baseLcp = ttfb / 1000 + 0.55 + blockingScripts.length * 0.42 + (heroMissingPriority ? 0.35 : 0) + Math.min(1.0, missingLazy.length * 0.12);
  if (stylesheets.length > 2) baseLcp += (stylesheets.length - 2) * 0.14;
  const lcp = Number((baseLcp * mult).toFixed(2));

  let baseCls = 0.01 + Math.min(0.35, missingDims.length * 0.06) + (!hasViewport ? 0.03 : 0) + (missingDisplaySwap.length > 0 ? 0.04 : 0);
  const cls = Number(baseCls.toFixed(3));

  const inp = Math.round(((isMobile ? 65 : 35) + blockingScripts.length * 55) * (isMobile ? 1.2 : 0.9));
  const fcp = Number(((ttfb / 1000 + 0.3 + blockingScripts.length * 0.28 + stylesheets.length * 0.08) * mult).toFixed(2));

  const scoreCurve = (val, good, poor, maxBad) => {
    if (val <= good) return 100 - (val / good) * 10;
    if (val <= poor) return 90 - ((val - good) / (poor - good)) * 40;
    return Math.max(0, 50 - ((val - poor) / (maxBad - poor)) * 50);
  };

  let weighted =
    scoreCurve(lcp, 2.5, 4.0, 6.0) * 0.3 +
    scoreCurve(cls, 0.1, 0.25, 0.5) * 0.25 +
    scoreCurve(inp, 200, 500, 1000) * 0.2 +
    scoreCurve(fcp, 1.8, 3.0, 5.0) * 0.15 +
    scoreCurve(ttfb, 800, 1800, 3000) * 0.1;

  const crits = issues.filter((i) => i.severity === 'CRITICAL').length;
  const warns = issues.filter((i) => i.severity === 'WARNING').length;
  weighted -= crits * 5 + warns * 2;
  const score = Math.max(5, Math.min(100, Math.round(weighted)));
  const rating = score >= 90 ? 'GOOD' : score >= 50 ? 'NEEDS_IMPROVEMENT' : 'POOR';

  return {
    score,
    rating,
    device: dev,
    metrics: {
      lcp: { value: lcp, unit: 's', rating: rateMetric('lcp', lcp), target: '≤ 2.5s' },
      cls: { value: cls, unit: '', rating: rateMetric('cls', cls), target: '≤ 0.10' },
      inp: { value: inp, unit: 'ms', rating: rateMetric('inp', inp), target: '≤ 200ms' },
      fcp: { value: fcp, unit: 's', rating: rateMetric('fcp', fcp), target: '≤ 1.8s' },
      ttfb: { value: ttfb, unit: 'ms', rating: rateMetric('ttfb', ttfb), target: '≤ 800ms' },
    },
    issues,
  };
}

export function transformHtml(html, options = {}) {
  const {
    optDeferScripts = true,
    optHeroPriority = true,
    optImageDims = true,
    optFontSwap = true,
    optPreconnect = true,
  } = options;

  let transformed = String(html || '');
  const changes = [];
  if (!transformed.trim()) return { transformed: '', changes };

  // Inject viewport meta if missing
  if (/<head\b[^>]*>/i.test(transformed) && !/<meta\b[^>]*name\s*=\s*["']?viewport/i.test(transformed)) {
    transformed = transformed.replace(
      /(<head\b[^>]*>)/i,
      '$1\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    );
    changes.push('Injected responsive <meta name="viewport"> tag');
  }

  if (optPreconnect && /fonts\.googleapis\.com/i.test(transformed) && !/rel=["']preconnect["']/i.test(transformed)) {
    transformed = transformed.replace(
      /(<head\b[^>]*>)/i,
      '$1\n  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    );
    changes.push('Injected Google Fonts preconnect hints');
  }

  if (optFontSwap && /fonts\.googleapis\.com/i.test(transformed)) {
    transformed = transformed.replace(/(fonts\.googleapis\.com\/css2?\?[^"'\s>]+)/gi, (m) =>
      m.includes('display=swap') ? m : `${m}&display=swap`,
    );
    changes.push('Appended &display=swap to Google Fonts links');
  }

  // Strictly <head>-scoped script deferral (never alters <body> scripts)
  if (optDeferScripts) {
    let count = 0;
    transformed = transformed.replace(/(<head\b[^>]*>)([\s\S]*?)(<\/head>)/i, (full, open, body, close) => {
      const nextBody = body.replace(/<script\b([^>]*)>/gi, (sFull, attrs) => {
        if (/\bsrc\s*=/i.test(attrs) && !/\b(defer|async)\b/i.test(attrs) && !/type\s*=\s*["']?module/i.test(attrs)) {
          count += 1;
          return `<script defer${attrs}>`;
        }
        return sFull;
      });
      return open + nextBody + close;
    });
    if (count > 0) changes.push(`Deferred ${count} render-blocking <head> script(s)`);
  }

  let imgIdx = 0;
  let firstSrc = '';
  transformed = transformed.replace(/<img\b([^>]*)>/gi, (full, attrs) => {
    imgIdx += 1;
    let nextAttrs = attrs;
    const srcM = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(attrs);
    if (imgIdx === 1 && srcM) firstSrc = srcM[1];

    if (optImageDims) {
      if (!/\bwidth\s*=/i.test(nextAttrs)) nextAttrs += imgIdx === 1 ? ' width="1280"' : ' width="640"';
      if (!/\bheight\s*=/i.test(nextAttrs)) nextAttrs += imgIdx === 1 ? ' height="720"' : ' height="400"';
    }
    if (optHeroPriority && imgIdx === 1 && !/\bfetchpriority=/i.test(nextAttrs)) {
      nextAttrs += ' fetchpriority="high" loading="eager"';
    } else if (imgIdx > 1 && !/\bloading=/i.test(nextAttrs)) {
      nextAttrs += ' loading="lazy" decoding="async"';
    }
    return `<img${nextAttrs}>`;
  });

  if (optHeroPriority && firstSrc && !firstSrc.startsWith('data:') && /<head\b[^>]*>/i.test(transformed)) {
    const safeHref = escapeAttr(firstSrc);
    if (!transformed.includes(`rel="preload" as="image" href="${safeHref}"`)) {
      transformed = transformed.replace(
        /(<head\b[^>]*>)/i,
        `$1\n  <link rel="preload" as="image" href="${safeHref}" fetchpriority="high">`,
      );
      changes.push(`Injected preload hint for hero LCP image (${firstSrc})`);
    }
  }

  return { transformed, changes };
}

export function compareDiff(baselineHtml, candidateHtml, device = 'mobile') {
  const base = auditHtml(baselineHtml, device);
  const cand = auditHtml(candidateHtml, device);
  const scoreDelta = cand.score - base.score;

  const deltaFor = (key, digits) => {
    const b = base.metrics[key].value;
    const c = cand.metrics[key].value;
    const raw = c - b;
    const d = digits > 0 ? Number(raw.toFixed(digits)) : Math.round(raw);
    return {
      baseline: b,
      candidate: c,
      delta: Object.is(d, -0) ? 0 : d,
      improved: d < 0,
      unit: base.metrics[key].unit,
    };
  };

  const candIds = new Set(cand.issues.map((i) => i.id));
  const resolved = base.issues.filter((i) => !candIds.has(i.id));

  return {
    baselineScore: base.score,
    candidateScore: cand.score,
    scoreDelta,
    resolvedCount: resolved.length,
    resolvedIssues: resolved,
    metricDeltas: {
      lcp: deltaFor('lcp', 2),
      cls: deltaFor('cls', 3),
      inp: deltaFor('inp', 0),
      fcp: deltaFor('fcp', 2),
      ttfb: deltaFor('ttfb', 0),
    },
    summary:
      scoreDelta > 0
        ? `Score increased from ${base.score} to ${cand.score} (+${scoreDelta} pts) with ${resolved.length} issue(s) resolved.`
        : scoreDelta < 0
        ? `Score regressed from ${base.score} to ${cand.score} (${scoreDelta} pts).`
        : `Identical CWV score (${base.score} → ${cand.score}, 0 pts delta).`,
  };
}

export function generateSpeculationRules(html, baseUrl = 'https://example.com', aggressiveness = 'balanced') {
  const unsafe = /(\/logout|\/signout|\/cart|\/checkout|\/admin|\/api\/|\/delete|\?action=)/i;
  const hrefs = new Set();
  for (const m of String(html || '').matchAll(/<a\b[^>]*href\s*=\s*["']([^"'#]+)["']/gi)) {
    const h = m[1].trim();
    if (h.startsWith('/')) hrefs.add(h);
  }
  if (hrefs.size === 0) {
    hrefs.add('/docs');
    hrefs.add('/features');
  }

  const prerender = [];
  const prefetch = [];
  const excluded = [];
  const limit = aggressiveness === 'aggressive' ? 5 : aggressiveness === 'conservative' ? 1 : 3;

  for (const path of hrefs) {
    if (unsafe.test(path)) excluded.push(path);
    else if (prerender.length < limit) prerender.push(path);
    else prefetch.push(path);
  }

  const eagerness = aggressiveness === 'aggressive' ? 'eager' : aggressiveness === 'conservative' ? 'conservative' : 'moderate';
  const rules = {
    prerender: [{ source: 'list', urls: prerender, eagerness }],
    ...(prefetch.length ? { prefetch: [{ source: 'list', urls: prefetch, eagerness: 'conservative' }] } : {}),
  };

  return {
    baseUrl,
    aggressiveness,
    prerender,
    prefetch,
    excluded,
    rules,
    scriptTag: `<script type="speculationrules">\n${JSON.stringify(rules, null, 2)}\n</script>`,
  };
}

export function auditPerformanceBudget(html, customBudgets = {}) {
  const raw = String(html || '');
  const limits = { script: 170, stylesheet: 50, image: 300, font: 100, total: 650, ...customBudgets };
  const extScripts = [...raw.matchAll(/<script\b[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi)];
  const stylesheets = [...raw.matchAll(/<link\b[^>]*rel=["'][^"']*stylesheet[^"']*["'][^>]*>/gi)];
  const images = [...raw.matchAll(/<img\b([^>]*)>/gi)];
  const fonts = [...raw.matchAll(/fonts\.googleapis\.com|@font-face|\.woff2/gi)];

  const scriptKb = Number((extScripts.length * 48).toFixed(1));
  const cssKb = Number((stylesheets.length * 24).toFixed(1));
  const imgKb = Number((images.length * 85).toFixed(1));
  const fontKb = Number((Math.min(4, fonts.length) * 32).toFixed(1));
  const docKb = Number((new TextEncoder().encode(raw).length / 1024).toFixed(1));
  const totalKb = Number((scriptKb + cssKb + imgKb + fontKb + docKb).toFixed(1));

  const checks = [
    { resourceType: 'script', actualKb: scriptKb, budgetKb: limits.script, status: scriptKb <= limits.script ? 'PASS' : 'OVER' },
    { resourceType: 'stylesheet', actualKb: cssKb, budgetKb: limits.stylesheet, status: cssKb <= limits.stylesheet ? 'PASS' : 'OVER' },
    { resourceType: 'image', actualKb: imgKb, budgetKb: limits.image, status: imgKb <= limits.image ? 'PASS' : 'OVER' },
    { resourceType: 'font', actualKb: fontKb, budgetKb: limits.font, status: fontKb <= limits.font ? 'PASS' : 'OVER' },
    { resourceType: 'total', actualKb: totalKb, budgetKb: limits.total, status: totalKb <= limits.total ? 'PASS' : 'OVER' },
  ];

  const loafRisks = extScripts
    .filter((s) => !/\b(defer|async)\b/i.test(s[0]))
    .map((s) => ({ script: s[1], estimatedBlockingMs: 115, reason: 'Parser-blocking synchronous external script' }));

  const lighthouseBudgetJson = [
    {
      path: '/*',
      resourceSizes: checks.map((c) => ({ resourceType: c.resourceType, budget: c.budgetKb })),
    },
  ];

  return {
    isPassing: checks.every((c) => c.status === 'PASS'),
    totalKb,
    checks,
    loafRisks,
    lighthouseBudgetJson,
  };
}
