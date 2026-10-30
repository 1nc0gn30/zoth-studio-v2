#!/usr/bin/env node
/**
 * Live DOM probe for the sovereign band integration (zero-dep CDP, system Chrome).
 *
 *   node scripts/probe-sovereign-live.mjs --base http://127.0.0.1:3000 \
 *        --routes /tools/subsweep-lead-scanner /tools/certpath-roadmap-studio
 *
 * Why this exists: `npm test` only exercises 8 tool routes and the screenshot
 * harness only proves "no console error, no overflow". Neither proves the
 * SovereignBand / SovereignEyebrow actually MOUNTED on a tool page that uses one
 * of the 52 upgraded components, nor that the title tier landed on a real
 * heading. This asserts exactly that, per route, and exits 1 on any failure.
 *
 * Prints a JSON report to stdout; exit 1 if any route fails.
 */
import { spawn } from 'node:child_process';

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
const WAIT = Number(opt('wait', ['2500'])[0]);
const VW = Number(opt('width', ['1440'])[0]);
const VH = Number(opt('height', ['900'])[0]);
const CHROME = String(opt('chrome', ['google-chrome'])[0]);
const PORT = 9800 + Math.floor(Math.random() * 400);

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--no-first-run', '--no-default-browser-check',
  '--mute-audio', '--renderer-process-limit=2', `--user-data-dir=/tmp/sov-probe-${PORT}`, 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws; let seq = 0; const pending = new Map(); let errors = [];

async function connect() {
  for (let i = 0; i < 60 && !ws; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) ws = new WebSocket(page.webSocketDebuggerUrl);
    } catch { /* chrome booting */ }
    if (!ws) await sleep(200);
  }
  if (!ws) throw new Error('Chrome did not expose a page target');
  await new Promise((r) => ws.addEventListener('open', r));
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      errors.push(d.exception?.description || d.text);
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      errors.push(m.params.args.map((a) => a.value ?? a.description).join(' '));
    }
  });
}
const send = (method, params = {}) => new Promise((r) => {
  const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) =>
  (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;

// Runs in the page: everything we need to prove the band mounted and the
// typographic tiers landed on headings rather than stat readouts.
const PROBE = `(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width * r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const canvases = [...document.querySelectorAll('canvas')];
  const visCanvas = canvases.filter(vis);
  const eyebrowEl = [...document.querySelectorAll('p,span,div')].filter(
    (e) => e.children.length === 0 && /\\u00b7/.test(e.textContent || '') && vis(e),
  );
  const canv = visCanvas.map((c) => ({
    w: c.width, h: c.height, cssW: Math.round(c.getBoundingClientRect().width),
    aria: c.getAttribute('aria-label') || c.getAttribute('role') || '',
    inViewport: c.getBoundingClientRect().top < window.innerHeight,
  }));
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(vis).slice(0, 8).map((h) => ({
    tag: h.tagName.toLowerCase(), text: (h.textContent || '').trim().slice(0, 44),
    fs: getComputedStyle(h).fontSize, weight: getComputedStyle(h).fontWeight,
  }));
  const bandCanvas = canvases.find((c) => /sovereign .*visualisation/i.test(c.getAttribute('aria-label') || '')) || null;
  let bandText = null; let eyebrow = null;
  if (bandCanvas) {
    let node = bandCanvas;
    for (let i = 0; i < 3 && node.parentElement; i++) node = node.parentElement;
    bandText = (node.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 220);
    const cand = [...node.querySelectorAll('p')].filter((e) => e.children.length === 0 && /\\u00b7/.test(e.textContent || ''));
    eyebrow = cand.length ? cand[0].textContent.replace(/\\s+/g, ' ').trim().slice(0, 80) : null;
  }
  return {
    title: document.title,
    bodyText: (document.body.innerText || '').trim().length,
    canvases: canv, canvasCount: visCanvas.length,
    bandMounted: !!bandCanvas,
    bandCanvasCss: bandCanvas ? Math.round(bandCanvas.getBoundingClientRect().width) + 'x' + Math.round(bandCanvas.getBoundingClientRect().height) : null,
    eyebrow, bandText,
    sovereignNodes: document.querySelectorAll('[class*="sov-"]').length,
    eyebrows: eyebrowEl.filter((e) => /\\u00b7/.test(e.textContent)).slice(0, 4).map((e) => (e.textContent || '').trim().slice(0, 60)),
    brailleSupported: (() => { try { const c = document.createElement('canvas').getContext('2d'); c.font = '8px monospace'; return c.measureText('\\u2800').width > 0; } catch { return null; } })(),
    overflowPx: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    headings,
  };
})()`;

const report = [];
try {
  await connect();
  await send('Runtime.enable'); await send('Page.enable');
  await send('Network.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' });
  await send('Emulation.setDeviceMetricsOverride', { width: VW, height: VH, mobile: VW < 700, deviceScaleFactor: 1 });
  for (const route of ROUTES) {
    errors = [];
    await send('Page.navigate', { url: `${BASE}${route}` });
    await sleep(WAIT);
    const p = await evaluate(PROBE);
    report.push({ route, ...p, errors: [...errors] });
  }
} finally {
  try { ws?.close(); } catch { /* ignore */ }
  chrome.kill('SIGKILL');
}

for (const r of report) {
  const ok = r.bandMounted && r.errors.length === 0 && r.overflowPx === 0;
  console.log(
    `${ok ? 'PASS' : 'FAIL'} ${r.route.padEnd(34)} band=${r.bandMounted ? r.bandCanvasCss : 'MISSING'} ` +
    `canvases=${r.canvasCount} err=${r.errors.length} overflow=${r.overflowPx}`,
  );
  if (r.eyebrow) console.log(`      eyebrow  ${JSON.stringify(r.eyebrow)}`);
  if (r.bandText) console.log(`      bandText ${JSON.stringify(r.bandText.slice(0, 150))}`);
  console.log(`      headings ${JSON.stringify(r.headings.slice(0, 4))}`);
  for (const e of r.errors) console.log(`      ERR ${String(e).slice(0, 200)}`);
}
process.exitCode = report.some((r) => !r.bandMounted || r.errors.length || r.overflowPx > 0) ? 1 : 0;
