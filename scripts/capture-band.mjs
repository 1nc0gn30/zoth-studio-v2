#!/usr/bin/env node
/**
 * Element-level screenshot of the SovereignBand on real tool routes.
 * Complements probe-sovereign-live.mjs (DOM) and the viewport capture harness
 * (above-the-fold only, so the band below the fold was never visually checked).
 *
 *   node scripts/capture-band.mjs --base http://127.0.0.1:3000 \
 *        --routes /tools/subsweep-lead-scanner --width 1440 --height 900
 *
 * Writes /tmp/sov-band/<slug>_<vw>.png and prints a JSON summary.
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
const OUT = String(opt('out', ['/tmp/sov-band'])[0]);
const CHROME = String(opt('chrome', ['google-chrome'])[0]);
const PORT = 9400 + Math.floor(Math.random() * 400);
mkdirSync(OUT, { recursive: true });

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--no-first-run', '--no-default-browser-check',
  '--mute-audio', '--hide-scrollbars', `--window-size=${VW},${VH}`,
  `--user-data-dir=/tmp/sov-band-${PORT}`, 'about:blank',
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
  if (!ws) throw new Error('Chrome did not expose a page target');
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

// Locate the SovereignBand: the canvas whose aria-label is the sovereign
// visualisation label, then return its own block (the bordered wrapper), its
// computed background and the text inside it only.
const FIND = `(() => {
  const c = [...document.querySelectorAll('canvas')].find(
    (x) => /sovereign .*visualisation/i.test(x.getAttribute('aria-label') || ''));
  if (!c) return { found: false };
  const wrap = c.parentElement;                       // the bordered Box
  const r = wrap.getBoundingClientRect();
  const cs = getComputedStyle(wrap);
  const ccs = getComputedStyle(c);
  const pageCs = getComputedStyle(document.body);
  return {
    found: true,
    canvasLabel: c.getAttribute('aria-label'),
    canvasCss: Math.round(c.getBoundingClientRect().width) + 'x' + Math.round(c.getBoundingClientRect().height),
    wrapBg: cs.backgroundColor, wrapBgImage: cs.backgroundImage.slice(0, 60),
    canvasPixels: c.width + 'x' + c.height,
    pageBg: pageCs.backgroundColor,
    text: (wrap.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 200),
    imgCount: wrap.querySelectorAll('img,svg').length,
  };
})()`;

async function shot(route) {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: BASE + route });
  await sleep(WAIT);
  const info = await evaluate(FIND);
  const slug = route.replace(/^\//, '').replace(/\//g, '_') || 'root';
  const file = `${OUT}/${slug}_${VW}.png`;
  if (!info || !info.found) return { route, file: null, ...(info || {}) };
  // Scroll the band to the top of the viewport, then capture the viewport.
  await evaluate(`(() => { const c = [...document.querySelectorAll('canvas')].find(
    (x) => /sovereign .*visualisation/i.test(x.getAttribute('aria-label') || ''));
    c.parentElement.scrollIntoView({ block: 'start' }); return true; })()`);
  await sleep(400);
  const box = await evaluate(`(() => { const c = [...document.querySelectorAll('canvas')].find(
    (x) => /sovereign .*visualisation/i.test(x.getAttribute('aria-label') || ''));
    const r = c.parentElement.getBoundingClientRect();
    return { x: Math.max(0, r.x), y: Math.max(0, r.y), w: r.width, h: r.height }; })()`);
  const res = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: box.x, y: box.y, width: Math.min(box.w, VW), height: Math.min(box.h, VH), scale: 1 },
  });
  writeFileSync(file, Buffer.from(res.result.data, 'base64'));
  return { route, file, box, ...info };
}

try {
  await connect();
  await send('Emulation.setDeviceMetricsOverride', { width: VW, height: VH, deviceScaleFactor: 1, mobile: VW < 500 });
  const out = [];
  for (const r of ROUTES) out.push(await shot(r));
  console.log(JSON.stringify(out, null, 2));
} finally {
  try { ws?.close(); } catch { /* ignore */ }
  chrome.kill('SIGKILL');
}
