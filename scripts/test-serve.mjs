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
  r = await req('/api/studio/launch', { method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' }, body: '{"tool":"terminal"}' });
  check('cross-origin launch blocked (403)', r.status === 403, r.status);
  r = await req('/', { method: 'DELETE' }); check('non-GET static 405', r.status === 405, r.status);
  r = await req('/'); check('nosniff header', r.headers['x-content-type-options'] === 'nosniff');

  const rt = spawn(process.execPath, [path.join(root, 'scripts/test-routes.mjs')], { stdio: 'inherit', env: { ...process.env, TEST_URL: base } });
  const code = await new Promise((res) => rt.on('exit', res));
  check('test-routes.mjs against serve.mjs', code === 0, `exit ${code}`);
} finally { srv.kill(); }
console.log(failed ? `\n${failed} check(s) failed` : '\nall serve checks passed');
process.exit(failed ? 1 : 0);
