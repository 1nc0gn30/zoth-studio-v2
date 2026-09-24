#!/usr/bin/env node
/**
 * Zoth Studio v2 Prerender, AEO Indexing & Static Route Engine
 * Generates static HTML entry points with route-specific head metadata,
 * Schema.org JSON-LD graphs, and crawler-readable semantic content for all 83+ routes.
 * Also synchronizes public/sitemap.xml and dist/sitemap.xml.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteConfig, getAllStaticRoutes, generateSchemaGraph } from '../src/config/site.js';
import { microTools } from '../src/data/toolsData.js';
import { workstations } from '../src/data/workstations.js';
import { mathPillars } from '../src/data/mathPillars.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('Error: dist/index.html not found. Run "vite build" first.');
  process.exit(1);
}

const template = fs.readFileSync(indexHtmlPath, 'utf8');

console.log('⚡ Prerendering static route HTML files for SEO, AEO, and AX indexing...');

const allRoutes = getAllStaticRoutes();
const routeEntries = Object.entries(allRoutes);
let generatedCount = 0;

/**
 * Builds rich, accessible, crawler-readable semantic content for the static HTML shell.
 * This is cleanly cleared and replaced when React hydrates with createRoot().
 */
function buildSemanticContent(routePath, meta) {
  let extraContent = '';

  if (routePath.startsWith('/tools/')) {
    const toolId = routePath.replace('/tools/', '');
    const tool = microTools.find((t) => t.id === toolId || t.repo === toolId);
    if (tool) {
      extraContent = `
        <section style="margin-top: 1.5rem; padding: 1rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 4px; background: rgba(212,175,55,0.03);">
          <p><strong>Category:</strong> ${tool.category} | <strong>Execution:</strong> ${tool.executionType} | <strong>Version:</strong> ${tool.version}</p>
          <pre style="background: #0D0E15; padding: 0.75rem; border: 1px solid #1E2230; border-radius: 4px; color: #D4AF37; overflow-x: auto;"><code>${tool.pull || `npx zoth pull ${tool.id}`}</code></pre>
          ${tool.github ? `<p><a href="${tool.github}" target="_blank" rel="noopener noreferrer" style="color: #60A5FA;">View Open-Source Repository ↗</a></p>` : ''}
        </section>
      `;
    }
  } else if (routePath.startsWith('/workstations/')) {
    const stationId = routePath.replace('/workstations/', '');
    const station = workstations.find((w) => w.id === stationId);
    if (station) {
      extraContent = `
        <section style="margin-top: 1.5rem; padding: 1rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 4px; background: rgba(212,175,55,0.03);">
          <p><strong>Operational Band:</strong> ${station.band} | <strong>Runtime:</strong> Decoupled v2 Native | <strong>Mode:</strong> Zero-Egress Air-Gapped</p>
          <p style="color: #9CA3AF;">Interactive sovereign workstation environment rendered directly inside Zoth Studio v2 without legacy host dependencies.</p>
        </section>
      `;
    }
  } else if (routePath.startsWith('/docs/math/')) {
    const pillarId = routePath.replace('/docs/math/', '');
    const pillar = mathPillars.find((p) => p.id === pillarId);
    if (pillar) {
      const metricRows = pillar.metrics.map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('');
      extraContent = `
        <section style="margin-top: 1.5rem; padding: 1rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 4px; background: rgba(212,175,55,0.03);">
          <h2 style="font-size: 1.25rem; color: #D4AF37;">Core Mathematical Equations &amp; Invariants</h2>
          <p><em>${pillar.subtitle}</em></p>
          <ul style="line-height: 1.8; margin-top: 0.5rem;">
            ${metricRows}
          </ul>
          <blockquote style="margin: 1rem 0; padding: 0.75rem 1rem; border-left: 3px solid #D4AF37; background: #0D0E15;">
            <code>${pillar.tiers.Intermediate}</code>
          </blockquote>
        </section>
      `;
    }
  } else if (routePath === '/memory') {
    extraContent = `
      <section style="margin-top: 1.5rem; padding: 1rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 4px; background: rgba(212,175,55,0.03);">
        <h2 style="font-size: 1.25rem; color: #D4AF37;">Lucy Netrunner Oracle &amp; STDP Synaptic Law</h2>
        <p>Guardian: Lucy (Lucyna Kushinada) // Codec 141.12 // Whitespace Cyberspace Stratum</p>
        <p>Synaptic Weight Dynamics: <code>Δw = A₊ · exp(-Δt / τ)</code></p>
        <p>Biomorphic long-term potentiation reinforces active decision vectors while decaying stale telemetry.</p>
      </section>
    `;
  }

  return `
    <div id="root">
      <div class="zoth-crawler-pre-render" style="padding: 2rem; max-width: 900px; margin: 0 auto; color: #E5E7EB; background: #08080B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; min-height: 100vh;">
        <nav aria-label="Breadcrumb" style="font-size: 0.85rem; color: #9CA3AF; margin-bottom: 1.5rem;">
          <a href="/" style="color: #D4AF37; text-decoration: none;">Home</a>
          ${routePath !== '/' ? ` &gt; <span style="color: #E5E7EB;">${meta.title.split('//')[0].trim()}</span>` : ''}
        </nav>

        <header style="margin-bottom: 2rem;">
          <h1 style="color: #D4AF37; font-size: 2rem; margin: 0 0 0.75rem 0; line-height: 1.2;">${meta.title}</h1>
          <p style="color: #9CA3AF; font-size: 1.1rem; line-height: 1.6; margin: 0;">${meta.description}</p>
        </header>

        <main>
          ${extraContent}

          <div style="margin-top: 2rem; padding: 1.25rem; border-top: 1px solid #1E2230;">
            <h3 style="font-size: 1rem; color: #D4AF37; margin-bottom: 0.75rem;">Sovereign Navigation Hub</h3>
            <ul style="display: flex; flex-wrap: wrap; gap: 1rem; padding: 0; list-style: none; font-size: 0.9rem;">
              <li><a href="/" style="color: #D4AF37; text-decoration: underline;">Home Hub</a></li>
              <li><a href="/memory" style="color: #D4AF37; text-decoration: underline;">Lucy Netrunner Memory</a></li>
              <li><a href="/swarm" style="color: #D4AF37; text-decoration: underline;">21 Swarm Pantheon</a></li>
              <li><a href="/tools" style="color: #D4AF37; text-decoration: underline;">25 Micro-Tools</a></li>
              <li><a href="/workstations" style="color: #D4AF37; text-decoration: underline;">37 Workstations</a></li>
              <li><a href="/consensus" style="color: #D4AF37; text-decoration: underline;">Consensus Battle Arena</a></li>
              <li><a href="/docs" style="color: #D4AF37; text-decoration: underline;">Documentation</a></li>
              <li><a href="/docs/math" style="color: #D4AF37; text-decoration: underline;">Six Math Pillars</a></li>
              <li><a href="/faqs" style="color: #D4AF37; text-decoration: underline;">FAQs</a></li>
              <li><a href="/ax" style="color: #D4AF37; text-decoration: underline;">Agent Experience (AX)</a></li>
            </ul>
          </div>
        </main>

        <footer style="margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #1E2230; font-size: 0.8rem; color: #6B7280; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <span>© 2026 NullAI Tech. Zero-Egress Air-Gapped Sovereign Studio.</span>
          <span><a href="/llms.txt" style="color: #9CA3AF;">llms.txt</a> | <a href="/llms-full.txt" style="color: #9CA3AF;">llms-full.txt</a> | <a href="/ai.txt" style="color: #9CA3AF;">ai.txt</a> | <a href="/sitemap.xml" style="color: #9CA3AF;">sitemap.xml</a></span>
        </footer>

        <noscript>
          <div style="margin-top: 2rem; padding: 1rem; background: #1B1300; border: 1px solid #D4AF37; color: #FDF3D0; border-radius: 4px;">
            <strong>JavaScript Required for Live Interactive Enclave:</strong> Zoth Studio v2 runs full interactive WebGL/WebGPU 3D matrices, live STDP plasticity curve plots, and local model orchestration when JavaScript is enabled in your browser.
          </div>
        </noscript>
      </div>
    </div>
  `;
}

// ── 1. PRERENDER ALL STATIC ROUTES ──
for (const [routePath, meta] of routeEntries) {
  const fullUrl = `${siteConfig.url}${routePath === '/' ? '' : routePath}`;
  const schemaJson = JSON.stringify(generateSchemaGraph(routePath), null, 2);

  let html = template;

  // 1. Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${meta.title}</title>`);

  // 2. Replace Description
  html = html.replace(
    /<meta name="description" content=".*?" \/>/i,
    `<meta name="description" content="${meta.description}" />`
  );

  // 3. Replace Canonical Link
  html = html.replace(
    /<link rel="canonical" href=".*?" \/>/i,
    `<link rel="canonical" href="${fullUrl}" />`
  );

  // 4. Replace Open Graph Tags
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/i,
    `<meta property="og:title" content="${meta.title}" />`
  );
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/i,
    `<meta property="og:description" content="${meta.description}" />`
  );
  html = html.replace(
    /<meta property="og:url" content=".*?" \/>/i,
    `<meta property="og:url" content="${fullUrl}" />`
  );

  // 5. Replace Twitter Tags
  html = html.replace(
    /<meta name="twitter:title" content=".*?" \/>/i,
    `<meta name="twitter:title" content="${meta.title}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content=".*?" \/>/i,
    `<meta name="twitter:description" content="${meta.description}" />`
  );

  // 6. Replace Schema.org JSON-LD
  html = html.replace(
    /<script type="application\/ld\+json" id="zoth-schema-graph">[\s\S]*?<\/script>/i,
    `<script type="application/ld+json" id="zoth-schema-graph">\n${schemaJson}\n    </script>`
  );

  // 7. Inject Semantic Static HTML Shell for Crawlers
  const semanticShell = buildSemanticContent(routePath, meta);
  html = html.replace(/<div id="root"><\/div>/i, semanticShell.trim());

  // Determine Target File Path
  let targetPath;
  if (routePath === '/') {
    targetPath = indexHtmlPath;
  } else {
    const cleanRoute = routePath.replace(/^\//, '');
    const routeDir = path.join(distDir, cleanRoute);
    fs.mkdirSync(routeDir, { recursive: true });
    targetPath = path.join(routeDir, 'index.html');
  }

  fs.writeFileSync(targetPath, html, 'utf8');
  generatedCount++;
}

console.log(`✔ Prerendered ${generatedCount} static HTML routes with Schema.org graphs and semantic shells.`);

// ── 2. SYNCHRONIZE SITEMAP.XML ──
console.log('⚡ Generating synchronized sitemap.xml for search and answer engines...');

function getSitemapPriority(routePath) {
  if (routePath === '/') return '1.0';
  if (routePath === '/memory') return '0.95';
  if (['/swarm', '/workstations', '/tools'].includes(routePath)) return '0.90';
  if (['/consensus', '/bridges', '/webgen', '/hexstrike', '/faqs', '/ax', '/docs'].includes(routePath)) return '0.85';
  if (['/zoth-os', '/adytum', '/templates', '/docs/math'].includes(routePath)) return '0.80';
  if (routePath.startsWith('/tools/')) return '0.75';
  if (routePath.startsWith('/workstations/')) return '0.75';
  if (routePath.startsWith('/docs/math/')) return '0.75';
  return '0.70';
}

function getSitemapChangeFreq(routePath) {
  if (['/', '/memory', '/swarm'].includes(routePath)) return 'daily';
  if (routePath.startsWith('/docs')) return 'monthly';
  return 'weekly';
}

const today = new Date().toISOString().split('T')[0];

const sitemapUrls = routeEntries.map(([routePath]) => {
  const loc = `${siteConfig.url}${routePath === '/' ? '/' : routePath}`;
  const priority = getSitemapPriority(routePath);
  const changefreq = getSitemapChangeFreq(routePath);

  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join('\n');

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</urlset>
`;

const publicSitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
const distSitemapPath = path.join(distDir, 'sitemap.xml');

fs.writeFileSync(publicSitemapPath, sitemapXml, 'utf8');
fs.writeFileSync(distSitemapPath, sitemapXml, 'utf8');

console.log(`✔ Generated sitemap.xml with ${routeEntries.length} routes in public/ and dist/.`);
console.log(`\n🎉 Prerendering complete: All ${generatedCount} static routes and sitemaps are production-ready!`);
