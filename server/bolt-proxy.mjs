// Zoth Bolt single source of truth: ~/NullAITech/bolt.diy on 127.0.0.1:5173.
// /bolt/* is a same-origin passthrough (HTML, assets, HMR websocket, API) so
// the real workbench can be embedded in an iframe from loopback, LAN or
// Tailscale without COOP/COEP or mixed-content breakage. The proxy strips
// frame-blocking / cross-origin-isolation headers on the way back and
// rewrites root-absolute HTML asset URLs onto the /bolt/ prefix.
import http from 'node:http';
import { isLocalHost, isLocalRequest } from './studio-api.mjs';

const BOLT_HOST = '127.0.0.1';
const BOLT_PORT = 5173;
const OFFLINE_HTML =
  '<!doctype html><meta charset="utf-8"><body style="background:#07080d;color:#d4af37;font-family:monospace;display:grid;place-items:center;height:100vh;margin:0"><div style="text-align:center"><p>⚡ Zoth Bolt fork is offline on :5173</p><p style="color:#888;font-size:12px">cd ~/NullAITech/bolt.diy &amp;&amp; npm run dev -- --port 5173</p></div></body>';

export function boltProxyMiddleware(req, res, next) {
  if (!req.url || !req.url.startsWith('/bolt/')) return next();
  if (!isLocalHost(req)) {
    res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ error: 'Untrusted host blocked.' }));
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD' && !isLocalRequest(req)) {
    res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ error: 'Cross-origin request blocked.' }));
    return;
  }
  const upstreamPath = req.url.slice('/bolt'.length) || '/';
  const headers = { ...req.headers, host: `${BOLT_HOST}:${BOLT_PORT}` };
  delete headers['accept-encoding']; // identity upstream keeps rewrites simple
  const upstream = http.request(
    { host: BOLT_HOST, port: BOLT_PORT, method: req.method, path: upstreamPath, headers },
    (up) => {
      const outHeaders = { ...up.headers };
      for (const h of ['x-frame-options', 'content-security-policy', 'cross-origin-opener-policy', 'cross-origin-embedder-policy', 'cross-origin-resource-policy']) {
        delete outHeaders[h];
      }
      const ctype = String(up.headers['content-type'] || '');
      // Remix emits root-absolute asset URLs (/assets/…). Inside the /bolt/
      // iframe document those would resolve against Studio's origin and 404,
      // so rewrite HTML href/src/action targets onto the /bolt/ prefix.
      if (ctype.includes('text/html')) {
        delete outHeaders['content-length'];
        delete outHeaders['content-encoding'];
        const chunks = [];
        up.on('data', (c) => chunks.push(c));
        up.on('end', () => {
          let html = Buffer.concat(chunks).toString('utf8');
          html = html.replace(/((?:href|src|action)=["'])\/(?!\/)/g, '$1/bolt/');
          res.writeHead(up.statusCode || 502, outHeaders);
          res.end(html);
        });
        up.on('error', () => { try { res.end(); } catch {} });
        return;
      }
      res.writeHead(up.statusCode || 502, outHeaders);
      up.pipe(res);
      up.on('error', () => { try { res.end(); } catch {} });
    },
  );
  upstream.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
    }
    res.end(OFFLINE_HTML);
  });
  req.pipe(upstream);
}

export function boltProxyUpgrade(req, socket, head) {
  if (!req.url || !req.url.startsWith('/bolt/')) return; // let Vite HMR handle the rest
  if (!isLocalHost(req) || !isLocalRequest(req)) {
    try {
      socket.write('HTTP/1.1 403 Forbidden\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nUntrusted host or origin blocked.');
      socket.destroy();
    } catch {}
    return;
  }
  const upstreamPath = req.url.slice('/bolt'.length) || '/';
  const upstream = http.request({
    host: BOLT_HOST,
    port: BOLT_PORT,
    method: req.method,
    path: upstreamPath,
    headers: { ...req.headers, host: `${BOLT_HOST}:${BOLT_PORT}` },
  });
  upstream.on('upgrade', (upRes, upSocket, upHead) => {
    const lines = [`${req.httpVersion} 101 Switching Protocols`];
    for (let i = 0; i < upRes.rawHeaders.length; i += 2) {
      lines.push(`${upRes.rawHeaders[i]}: ${upRes.rawHeaders[i + 1]}`);
    }
    socket.write(lines.join('\r\n') + '\r\n\r\n');
    if (upHead && upHead.length) upSocket.unshift(upHead);
    if (head && head.length) socket.unshift(head);
    upSocket.pipe(socket);
    socket.pipe(upSocket);
    const kill = () => { try { upSocket.destroy(); } catch {} try { socket.destroy(); } catch {} };
    upSocket.on('error', kill);
    socket.on('error', kill);
    upSocket.on('close', kill);
    socket.on('close', kill);
  });
  upstream.on('error', () => { try { socket.destroy(); } catch {} });
  upstream.end();
}
