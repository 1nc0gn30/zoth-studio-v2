#!/usr/bin/env node
/**
 * Reads the SovereignBand canvas pixels directly (not a compositor screenshot)
 * and saves the canvas' own PNG via toDataURL, so a blank canvas cannot hide
 * behind a screenshot artefact.
 *
 *   node scripts/canvas-pixels.mjs --routes /tools/subsweep-lead-scanner --width 1440
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const vals = [];
  for (let j = i + 1; j < args.length && !args[j].startsWith('--'); j++) vals.push(args[j]);
  return vals.length ? vals : true;
};
const BASE = String(opt('base', ['http://127.0.0.1:3000'])[0]).replace(/\/$/, '');
const ROUTES = opt('routes', ['/']);
const WAIT = Number(opt('wait', ['4000'])[0]);
const VW = Number(opt('width', ['1440'])[0]);
const VH = Number(opt('height', ['900'])[0]);
const OUT = String(opt('out', ['/tmp/sov-canvas'])[0]);
const CHROME = String(opt('chrome', ['google-chrome'])[0]);
const PORT = 9700 + Math.floor(Math.random() * 200);
mkdirSync(OUT, { recursive: true });

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--no-first-run', '--no-default-browser-check',
  '--mute-audio', '--hide-scrollbars', `--window-size=${VW},${VH}`,
  `--user-data-dir=/tmp/sov-canvas-${PORT}`, 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws; let seq = 0; const pending = new Map();
async function connect() {
  for (let i = 0; i < 80 && !ws; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) ws = new WebSocket(page.webSocketDebuggerUrl);
    } catch { /* booting */ }
    if (!ws) await sleep(200);
  }
  if (!ws) throw new Error('no page target');
  await new Promise((r) => ws.addEventListener('open', r));
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  });
}
const send = (method, params = {}) => new Promise((r) => {
  const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) =>
  (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }))
    .result?.result?.value;

// Sample the band canvas: alpha coverage, colour variety, and the drawn image.
const SAMPLE = `(() => {
  const find = () => [...document.querySelectorAll('canvas')].find(
    (x) => /sovereign .*visualisation/i.test(x.getAttribute('aria-label') || ''));
  const c = find();
  if (!c) return { found: false };
  const ctx = c.getContext('2d');
  let stats = { found: true, w: c.width, h: c.height, painted: null };
  try {
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let nonTransparent = 0; const colours = new Set();
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 0) { nonTransparent++; if (colours.size < 64) colours.add(d[i] + ',' + d[i+1] + ',' + d[i+2]); }
    }
    stats.nonTransparent = nonTransparent;
    stats.totalPx = c.width * c.height;
    stats.coveragePct = +(100 * nonTransparent / (c.width * c.height)).toFixed(2);
    stats.distinctColoursCapped = colours.size;
    stats.sample = [...colours].slice(0, 8);
  } catch (e) { stats.readError = String(e).slice(0, 120); }
  try { stats.dataUrl = c.toDataURL('image/png'); } catch (e) { stats.dataUrlError = String(e).slice(0, 120); }
  stats.bookmark = c.getAttribute('aria-label');
  return stats;
})()`;

try {
  await connect();
  await send('Emulation.setDeviceMetricsOverride', { width: VW, height: VH, deviceScaleFactor: 1, mobile: VW < 500 });
  const out = [];
  for (const route of ROUTES) {
    await send('Page.enable'); await send('Runtime.enable');
    await send('Page.navigate', { url: BASE + route });
    await sleep(WAIT);
    const s = await evaluate(SAMPLE);
    const slug = route.replace(/^\//, '').replace(/\//g, '_') || 'root';
    if (s && s.dataUrl) {
      const b64 = s.dataUrl.split(',')[1];
      const f = `${OUT}/${slug}_${VW}.png`;
      writeFileSync(f, Buffer.from(b64, 'base64'));
      out.push({ route, file: f, ...s, dataUrl: `(${Math.round(s.dataUrl.length / 1024)}KB)` });
    } else {
      out.push({ route, ...(s || {}) });
    }
  }
  console.log(JSON.stringify(out, null, 2));
} finally {
  try { ws?.close(); } catch { /* ignore */ }
  chrome.kill('SIGKILL');
}
