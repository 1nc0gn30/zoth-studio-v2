# Netlify AX & Serverless Edge Engineering Directive (v2.4.0)

You are auditing a **Zoth Studio v2** (`https://github.com/NullAITech/zoth-studio-v2`) Netlify production deployment (`https://zoth.nullai.tech`).

## Core Production Guardrails

1. **Build & Publish Parity**: Verify `[build] command = "npm run build"` and `publish = "dist"`, with `[functions] node_bundler = "esbuild"`, `functions = "netlify/functions"`, and `edge_functions = "netlify/edge-functions"`.
2. **Deterministic Node Runtime**: Pin `[build.environment] NODE_VERSION = "20"` (or explicit semver `20.x`) to prevent CI drift.
3. **Redirect Graph Integrity**: Validate `netlify.toml` `[[redirects]]` and `_redirects` for circular cycles, self-redirects, invalid HTTP statuses, and rules shadowed by an earlier `/* -> /index.html 200` catch-all. Keep the SPA catch-all last.
4. **Core Security & WebGPU Enclave Headers (`/*`)**:
   - `X-Frame-Options = "SAMEORIGIN"`
   - `Content-Security-Policy = "frame-ancestors 'self' https://zoth.nullai.tech ..."`
   - `X-Content-Type-Options = "nosniff"`
   - `Referrer-Policy = "strict-origin-when-cross-origin"`
   - `Cross-Origin-Opener-Policy = "same-origin"`
   - `Cross-Origin-Embedder-Policy = "credentialless"`
5. **Immutable Asset Caching & AEO Headers**: Set `Cache-Control = "public, max-age=31536000, immutable"` on `/assets/*`, and explicit `Content-Type` + `Access-Control-Allow-Origin = "*"` on `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/ai.txt`, and `/.well-known/*`.
6. **Zero Credential Leakage**: Never read `~/.config/netlify/config.json`, commit `.env*`, or embed `NETLIFY_AUTH_TOKEN`, `ghp_*`, `sk_live_*`, or AWS keys. Manage runtime secrets manually via `netlify env:set KEY VALUE`.
7. **Deterministic Verification**: Run `npm run test:netlify-ax`, inspect `GET http://127.0.0.1:3000/api/studio/netlify-ax`, or validate patches via `POST http://127.0.0.1:3000/api/studio/netlify-ax/audit` and dry-run locally with `netlify build --dry`.

## Canonical Reference Endpoints

- Workstation: `https://zoth.nullai.tech/workstations/netlify-ax` (alias `/tools/netlify-ax`)
- Loopback Inspector API: `http://127.0.0.1:3000/api/studio/netlify-ax`
- Loopback Audit API: `http://127.0.0.1:3000/api/studio/netlify-ax/audit`
- Static Manifest: `https://zoth.nullai.tech/api/netlify-ax.json`
- MCP Spec: `https://zoth.nullai.tech/api/netlify-ax-mcp.json`
- CLI Entry: `zoth open netlify-ax --json`
