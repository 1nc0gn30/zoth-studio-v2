# Answer Engine Optimization (AEO) & Agent Experience (AX) Specification

## Objective
To ensure Zoth Studio v2 is seamlessly understood, correctly cited, and accurately indexed by both human search engines (Google, Bing) and autonomous AI answer engines (ChatGPT, Claude, Perplexity, OpenClaw).

## Multi-Layer Metadata Architecture

### Layer 1: Build-Time Prerendered Static HTML (`dist/<route>/index.html`)
Search engines read the emitted HTML before executing client-side scripts.
- Every route receives its own `dist/<route>/index.html` file with:
  - Keyword-first `<title>` tag.
  - Descriptive `<meta name="description">` tag.
  - Canonical link tag.
  - Open Graph (`og:*`) and Twitter Card tags.
  - Static fallback `<noscript>` semantic HTML shell (`<h1>`, `<p>`, `<nav>`).

### Layer 2: Runtime Reactive Head Updates (`SEO.jsx`)
When navigating client-side via React Router, the `<SEO>` component updates `document.title`, `<meta>` tags, and the `<script type="application/ld+json">` graph in real-time.

### Layer 3: Schema.org Structured Data Graphs
Every route includes a full JSON-LD `@graph` defining:
- `WebSite`: Publisher identity and site description.
- `Organization`: NullAI Tech identity, logo, and social handles.
- `SoftwareApplication`: Zoth Studio v2 category, OS support, and free offer.
- `WebPage`: Route title, URL, description, and `SpeakableSpecification` targeting `h1`, `h2`, and `p`.
- `BreadcrumbList`: Hierarchical breadcrumbs.
- `FAQPage`: (on `/faqs`) Explicit Q&A pairs matching visible accordion content.

### Layer 4: Machine-Readable Entity Files
- `/robots.txt`: Explicit `Allow` rules for `GPTBot`, `Claude-Web`, `PerplexityBot`, `Bingbot`, `Googlebot`.
- `/sitemap.xml`: Complete route inventory with priority and change frequencies.
- `/llms.txt`: Plain-text markdown fact sheet (< 5 KB) describing system capabilities, endpoints, and security guarantees.
- `/ax`: Interactive Agent Experience page and JSON export endpoint.
