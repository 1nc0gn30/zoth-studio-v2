#!/usr/bin/env node
// Tests server/serve.mjs against the built dist/: routing, SPA fallback, traversal
// protection, API mount and cross-origin write blocking. Then runs test-routes.mjs
// against the same server, so `npm test` never hits a stale :3000.
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!fs.existsSync(path.join(root, 'dist', 'index.html'))) { console.error('dist/ missing: run npm run build first'); process.exit(1); }
const PORT = 3000 + 100 + Math.floor(Math.random() * 800);
const base = `http://127.0.0.1:${PORT}`;
const srv = spawn(process.execPath, [path.join(root, 'server/serve.mjs'), '--port', String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });

function req(p, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const r = http.request(base + p, { method, headers }, (res) => { let d = ''; res.on('data', (c) => (d += c)); res.on('end', () => resolve({ status: res.statusCode, body: d, headers: res.headers })); });
    r.on('error', reject); if (body) r.write(body); r.end();
  });
}
let failed = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  ' + extra}`); if (!ok) failed++; };

try {
  for (let i = 0; i < 50; i++) { try { await req('/'); break; } catch { await new Promise((r) => setTimeout(r, 100)); } }
  let r = await req('/'); check('home 200 html', r.status === 200 && /<html/i.test(r.body));
  for (const p of ['/voice', '/voice/', '/gallery/', '/tools/']) { r = await req(p); check(`prerendered ${p} 200`, r.status === 200, r.status); }
  r = await req('/some/client/route'); check('SPA fallback 200', r.status === 200 && /<html/i.test(r.body), r.status);
  r = await req('/missing-file.js'); check('missing asset 404', r.status === 404, r.status);
  r = await req('/../../etc/passwd'); check('traversal does not leak /etc/passwd', !/root:x:0:0/.test(r.body));
  r = await req('/%2e%2e/%2e%2e/etc/passwd'); check('encoded traversal blocked', !/root:x:0:0/.test(r.body));
  r = await req('/api/studio/status'); check('Studio API mounted', r.status === 200 && r.body.trim().startsWith('{'), r.status);
  r = await req('/api/studio/composer/providers');
  check('Composer providers API 200 JSON', r.status === 200 && /"providers"/.test(r.body) && /"transform"/.test(r.body), r.status);
  r = await req('/api/studio/composer/step', { method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' }, body: '{"provider":"transform","prompt":"hi"}' });
  check('Composer step cross-origin blocked (403)', r.status === 403, r.status);
  r = await req('/api/studio/composer/step', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: '{"provider":"transform","model":"json-validate","prompt":"{\\"ok\\":true}"}' });
  check('Composer step local transform (200)', r.status === 200 && /"ok":true/.test(r.body) && /VALID JSON/.test(r.body), `${r.status} ${r.body.slice(0, 120)}`);
  r = await req('/api/studio/agent/triad');
  check('Agent triad no 500 & no /home/ leak', r.status !== 500 && !/\/home\/[a-z0-9_-]+\//i.test(r.body), `${r.status}`);
  r = await req('/api/tools.json');
  check('Static /api/tools.json 200 JSON (85 tools)', r.status === 200 && /application\/json/.test(String(r.headers['content-type'] || '')) && /"tool_count":\s*85/.test(r.body), `${r.status}`);
  r = await req('/api/index.json');
  check('Static /api/index.json 200 JSON', r.status === 200 && /application\/json/.test(String(r.headers['content-type'] || '')) && /"openAccess":\s*true/.test(r.body), `${r.status}`);
  r = await req('/api/workstations.json');
  check('Static /api/workstations.json 200 JSON (45 workstations)', r.status === 200 && /application\/json/.test(String(r.headers['content-type'] || '')) && /"workstation_count":\s*45/.test(r.body), `${r.status}`);
  r = await req('/api/studio/brand/tokens');
  check('Brand tokens API 200 JSON (6 seals + dual-theme)', r.status === 200 && /application\/json/.test(String(r.headers['content-type'] || '')) && /"ghostbyte-sanctum"/.test(r.body) && /"#FAF8F3"/.test(r.body), `${r.status}`);
  r = await req('/api/studio/bus/telemetry');
  check('Bus telemetry API 200 JSON (12 loopback nodes)', r.status === 200 && /application\/json/.test(String(r.headers['content-type'] || '')) && /"schemaVersion":"2.3.0"/.test(r.body) && /"nodes":\[/.test(r.body), `${r.status}`);
  r = await req('/api/studio/bus/telemetry', { headers: { Host: 'evil.example.invalid' } });
  check('Bus telemetry GET DNS-rebinding blocked (403)', r.status === 403 && /Untrusted host blocked/.test(r.body), `${r.status} ${r.body.slice(0, 80)}`);
  r = await req('/api/studio/bridge', { headers: { Host: 'evil.example.invalid' } });
  check('Bridge GET DNS-rebinding blocked (403)', r.status === 403 && /Untrusted host blocked/.test(r.body), `${r.status} ${r.body.slice(0, 80)}`);
  r = await req('/api/studio/bus/ping', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify({ port: PORT }) });
  check('Bus ping local loopback port (200 ok)', r.status === 200 && /"ok":true/.test(r.body) && /"host":"127.0.0.1"/.test(r.body), `${r.status} ${r.body.slice(0, 120)}`);
  r = await req('/api/studio/bus/ping', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify({ host: '169.254.169.254', port: 80 }) });
  check('Bus ping SSRF external/metadata host rejected (400)', r.status === 400, `${r.status} ${r.body.slice(0, 100)}`);
  r = await req('/api/studio/bus/ping', { method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' }, body: JSON.stringify({ port: PORT }) });
  check('Bus ping cross-origin blocked (403)', r.status === 403, `${r.status}`);
  r = await req('/api/studio/chronicle/summary');
  check('Chronicle summary API 200 JSON (no /home/ leak)', r.status === 200 && /application\/json/.test(String(r.headers['content-type'] || '')) && /"schemaVersion":"2.3.0"/.test(r.body) && !/\/home\/[a-z0-9_-]+\//i.test(r.body), `${r.status} ${r.body.slice(0, 140)}`);
  r = await req('/api/studio/chronicle/summary', { headers: { Host: 'evil.example.invalid' } });
  check('Chronicle summary GET DNS-rebinding blocked (403)', r.status === 403 && /Untrusted host blocked/.test(r.body), `${r.status} ${r.body.slice(0, 80)}`);
  r = await req('/api/studio/chronicle/recall', { method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' }, body: '{"query":"zoth-studio-v2"}' });
  check('Chronicle recall cross-origin blocked (403)', r.status === 403, `${r.status}`);
  r = await req('/api/studio/chronicle/recall', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: '{bad-json' });
  check('Chronicle recall malformed JSON rejected (400)', r.status === 400, `${r.status}`);
  r = await req('/api/studio/chronicle/recall', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: '{"query":"zoth-studio-v2"}' });
  check('Chronicle recall local POST 200 JSON (no /home/ leak)', r.status === 200 && /"related_memories":\[/.test(r.body) && !/\/home\/[a-z0-9_-]+\//i.test(r.body), `${r.status} ${r.body.slice(0, 140)}`);
  r = await req('/api/studio/chronicle/search?q=chronicle&limit=5');
  check('Chronicle search GET 200 JSON (no /home/ leak)', r.status === 200 && /"conversations":\[/.test(r.body) && !/\/home\/[a-z0-9_-]+\//i.test(r.body), `${r.status} ${r.body.slice(0, 140)}`);
  r = await req('/api/studio/cockpit');
  check('Cockpit API 200 JSON (host, fleet, daemons, no /home/ leak)', r.status === 200 && /application\/json/.test(String(r.headers['content-type'] || '')) && /"schemaVersion":"2.3.0"/.test(r.body) && /"host":\{/.test(r.body) && /"fleet":\{/.test(r.body) && !/\/home\/[a-z0-9_-]+\//i.test(r.body), `${r.status} ${r.body.slice(0, 140)}`);
  r = await req('/api/studio/cockpit', { headers: { Host: 'evil.example.invalid' } });
  check('Cockpit GET DNS-rebinding blocked (403)', r.status === 403 && /Untrusted host blocked/.test(r.body), `${r.status} ${r.body.slice(0, 80)}`);
  r = await req('/api/studio/connectors');
  check('Connectors API 200 JSON (providers, harnesses, bridges, mcpServers, 0 /home/ leaks)', r.status === 200 && /application\/json/.test(String(r.headers['content-type'] || '')) && /"schemaVersion":"2.3.0"/.test(r.body) && /"providers":\[/.test(r.body) && /"harnesses":\[/.test(r.body) && /"bridges":\[/.test(r.body) && !/\/home\/[a-z0-9_-]+\//i.test(r.body), `${r.status} ${r.body.slice(0, 140)}`);
  r = await req('/api/studio/connectors', { headers: { Host: 'evil.example.invalid' } });
  check('Connectors GET DNS-rebinding blocked (403)', r.status === 403 && /Untrusted host blocked/.test(r.body), `${r.status} ${r.body.slice(0, 80)}`);
  r = await req('/api/studio/connectors/probe', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify({ host: '169.254.169.254', port: 8080 }) });
  check('Connectors probe SSRF external/IMDS rejected (400)', r.status === 400, `${r.status} ${r.body.slice(0, 100)}`);
  r = await req('/api/studio/connectors/probe', { method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' }, body: JSON.stringify({ port: PORT }) });
  check('Connectors probe cross-origin blocked (403)', r.status === 403, `${r.status}`);
  r = await req('/api/studio/connectors/probe', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify({ port: PORT, path: '/api/studio/status' }) });
  check('Connectors probe local loopback port (200 online)', r.status === 200 && /"online":true/.test(r.body) && /"host":"127.0.0.1"/.test(r.body), `${r.status} ${r.body.slice(0, 140)}`);
  r = await req('/api/studio/ax/audit');
  check('AX audit API 200 JSON (driftCount 0)', r.status === 200 && /application\/json/.test(String(r.headers['content-type'] || '')) && /"driftCount":0/.test(r.body), `${r.status} ${r.body.slice(0, 180)}`);
  r = await req('/api/studio/ax/validate', { method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' }, body: '{"spec":"robots.txt","content":"User-agent: *\\nAllow: /"}' });
  check('AX validate cross-origin blocked (403)', r.status === 403, r.status);
  r = await req('/api/studio/ax/validate', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: '{"spec":"robots.txt","content":"User-agent: *\\nAllow: /\\nCrawl-delay: 0\\nUser-agent: Googlebot\\nAllow: /\\nUser-agent: GPTBot\\nAllow: /\\nUser-agent: ClaudeBot\\nAllow: /\\nUser-agent: PerplexityBot\\nAllow: /\\nSitemap: https://zoth.nullai.tech/sitemap.xml"}' });
  check('AX validate local request (200 valid)', r.status === 200 && /"valid":true/.test(r.body) && /"score":100/.test(r.body), `${r.status} ${r.body.slice(0, 120)}`);
  r = await req('/api/unknown-composer-check');
  check('Unknown /api/* returns JSON 404', r.status === 404 && /application\/json/.test(String(r.headers['content-type'] || '')), r.status);
  r = await req('/api/studio/launch', { method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' }, body: '{"tool":"terminal"}' });
  check('cross-origin launch blocked (403)', r.status === 403, r.status);
  r = await req('/', { method: 'DELETE' }); check('non-GET static 405', r.status === 405, r.status);
  r = await req('/');
  check('nosniff header', r.headers['x-content-type-options'] === 'nosniff');
  check('X-Frame-Options SAMEORIGIN', r.headers['x-frame-options'] === 'SAMEORIGIN', r.headers['x-frame-options']);
  check('Referrer-Policy strict-origin-when-cross-origin', r.headers['referrer-policy'] === 'strict-origin-when-cross-origin', r.headers['referrer-policy']);
  check('Loopback CSP header present', /frame-src 'self' http:\/\/127\.0\.0\.1:\*/.test(String(r.headers['content-security-policy'] || '')), r.headers['content-security-policy']);

  const rt = spawn(process.execPath, [path.join(root, 'scripts/test-routes.mjs')], { stdio: 'inherit', env: { ...process.env, TEST_URL: base } });
  const code = await new Promise((res) => rt.on('exit', res));
  check('test-routes.mjs against serve.mjs', code === 0, `exit ${code}`);
} finally { srv.kill(); }
console.log(failed ? `\n${failed} check(s) failed` : '\nall serve checks passed');
process.exit(failed ? 1 : 0);
