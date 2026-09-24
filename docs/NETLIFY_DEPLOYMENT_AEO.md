# Netlify Production Deployment & 83-Route AEO Specification

## Overview

Zoth Studio v2 combines a modern React 18 Single-Page Application (SPA) with a build-time static prerendering engine. This produces a production build optimized for **Netlify Edge** deployment, featuring 83 prerendered static routes, full Answer Engine Optimization (AEO), Agent Experience (AX) discovery endpoints, and strict security headers.

---

## 1. Build Pipeline & Commands

### Prerequisites
- Node.js `>= 20.0.0`
- NPM `>= 10.0.0`

### Build Command
```bash
npm run build
```

Under the hood, `npm run build` triggers a two-stage compilation pipeline:
1. `vite build`: Compiles the React 18 application, bundles ESM chunks, minifies CSS/JS assets, and generates the initial `dist/index.html` shell.
2. `node scripts/prerender.mjs`: Parses the static route manifest (`src/config/site.js`), generates route-specific `<title>`, `<meta>`, Open Graph, Twitter cards, and Schema.org JSON-LD `@graph` structures, and writes 83 distinct static HTML files into `dist/`.

---

## 2. The 83 Prerendered Static Routes

The prerendering engine guarantees instant Time-To-First-Byte (TTFB) and crawlability for search engines (Google, Bing) and AI answer engines (ChatGPT, Claude, Perplexity):

| Route Category | Count | Route Patterns |
| :--- | :--- | :--- |
| **Core Hub & Pages** | 15 | `/`, `/docs`, `/memory`, `/swarm`, `/bridges`, `/consensus`, `/hexstrike`, `/zoth-os`, `/webgen`, `/adytum`, `/faqs`, `/ax`, `/workstations`, `/tools`, `/templates` |
| **Workstations** | 37 | `/workstations/agent-composer`, `/workstations/brand-seals`, `/workstations/cyberpunk-hud`, `/workstations/ide`, `/workstations/mission-control`, etc. |
| **Micro-Tools** | 25 | `/tools/jwt-inspector-guard`, `/tools/payload-entropy-studio`, `/tools/polyglot-framework-exporter`, `/tools/cwv-speed-engine`, etc. |
| **Math Pillars** | 6 | `/docs/math/linear`, `/docs/math/calculus`, `/docs/math/probability`, `/docs/math/hessian`, `/docs/math/lyapunov`, `/docs/math/stdp` |
| **Total** | **83** | Fully prerendered with dedicated semantic HTML fallback shells in `dist/` |

---

## 3. Netlify Configuration (`netlify.toml`)

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--no-audit"

[site]
  prerender = true

# Serverless API proxy for hosted execution mode
[[redirects]]
  from = "/api/studio/*"
  to = "/.netlify/functions/studio-api/:splat"
  status = 200

# Legacy route migrations
[[redirects]]
  from = "/hub"
  to = "/"
  status = 301

[[redirects]]
  from = "/hub/*"
  to = "/:splat"
  status = 301

# SPA client-side fallback (static files in dist/ take precedence)
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Security & Caching Headers
- **Security**:
  - `X-Frame-Options: SAMEORIGIN`
  - `Content-Security-Policy: frame-ancestors 'self' https://zoth.nullai.tech https://*.nullai.tech http://127.0.0.1:* http://localhost:*`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **Asset Caching**:
  - Immutable 1-year cache (`Cache-Control: public, max-age=31536000, immutable`) for `/assets/*`, `/fonts/*`, `/brand/*`, `/mascot/*`, `/pets/*`.
- **AEO Discovery Headers**:
  - Open CORS (`Access-Control-Allow-Origin: *`) on `/sitemap.xml`, `/robots.txt`, `/llms.txt`, and `/ai.txt`.

---

## 4. Machine-Readable Discovery Endpoints

1. **`/llms.txt`**: Standardized, compact plain-text specification for rapid grounding by AI assistants and autonomous agents.
2. **`/llms-full.txt`**: Exhaustive system manual with complete schema definitions and enclave security proofs.
3. **`/ai.txt`**: Explicit AI crawling, training, and grounding permissions policy.
4. **`/sitemap.xml`**: Synchronized XML sitemap cataloging all 83 static routes with priority mappings.
5. **`/robots.txt`**: Robot exclusion protocol with explicit `Allow` directives for AI bots (`GPTBot`, `Claude-Web`, `PerplexityBot`).
6. **`/api/ax/manifest.json`**: Agent Experience machine discovery manifest.
