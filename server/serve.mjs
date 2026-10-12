#!/usr/bin/env node
// Zoth Studio production server: prerendered dist/ + the Studio API on loopback.
// Usage: node server/serve.mjs [--port 3000] [--dir dist]
// Replaces `python3 -m http.server`, which served files only, so every
// /api/studio/* call (status, launch, bridge, memory) 404'd in the browser.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { studioMiddleware } from './studio-api.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : dflt; };
const PORT = Number(arg('--port', process.env.PORT || 3000));
const HOST = '127.0.0.1';
const ROOT = path.resolve(arg('--dir', path.join(here, '..', 'dist')));

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.wasm': 'application/wasm',
  '.webmanifest': 'application/manifest+json',
};

function resolveFile(urlPath) {
  let rel;
  try { rel = decodeURIComponent(urlPath.split('?')[0]); } catch { return null; }
  const abs = path.resolve(ROOT, '.' + path.posix.normalize('/' + rel));
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) return null;      // traversal
  const tries = [abs, path.join(abs, 'index.html'), abs + '.html'];
  for (const f of tries) { try { if (fs.statSync(f).isFile()) return f; } catch {} }
  return undefined;                                                        // not found
}

const api = studioMiddleware();
const server = http.createServer((req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  api(req, res, () => {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
    let file = resolveFile(req.url);
    if (file === null) { res.writeHead(403); res.end('Forbidden'); return; }
    let status = 200;
    if (file === undefined) {
      const looksLikeAsset = /\.[a-z0-9]{2,5}$/i.test(req.url.split('?')[0]);
      if (looksLikeAsset) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found'); return; }
      file = path.join(ROOT, 'index.html');                                 // SPA route fallback
    }
    const ext = path.extname(file).toLowerCase();
    const headers = { 'Content-Type': TYPES[ext] || 'application/octet-stream' };
    headers['Cache-Control'] = /[\\/]assets[\\/].*-[A-Za-z0-9_-]{8,}\./.test(file) ? 'public, max-age=31536000, immutable' : 'no-cache';
    fs.stat(file, (err, st) => {
      if (err) { res.writeHead(404); res.end(); return; }
      headers['Content-Length'] = st.size;
      res.writeHead(status, headers);
      if (req.method === 'HEAD') { res.end(); return; }
      fs.createReadStream(file).pipe(res);
    });
  });
});
server.on('error', (e) => { console.error(`[zoth-studio] ${e.code === 'EADDRINUSE' ? `port ${PORT} is busy` : e.message}`); process.exit(1); });
server.listen(PORT, HOST, () => console.log(`[zoth-studio] serving ${ROOT} + Studio API at http://${HOST}:${PORT}/`));
