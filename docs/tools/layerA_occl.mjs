#!/usr/bin/env node
/**
 * Focused two-state experiment for pixel-cast occlusion (zero-dep CDP).
 * Question: is the left control column reachable by a real pointer at rest,
 * and does a state toggle (fullscreen) put #viewportStage over it?
 *
 *   node layerA_occl.mjs --base http://127.0.0.1:8148 --route /
 */
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i === -1 ? d : args[i + 1]; };
const BASE = String(opt('base', 'http://127.0.0.1:8148')).replace(/\/$/, '');
const ROUTE = opt('route', '/');
const VW = 1440, VH = 900;
const PORT = 9700 + Math.floor(Math.random() * 200);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn('google-chrome', [
  '--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-proxy-server',
  `--remote-debugging-port=${PORT}`, '--no-first-run', '--no-default-browser-check',
  `--window-size=${VW},${VH}`, '--mute-audio', '--renderer-process-limit=2',
  `--user-data-dir=/tmp/layerA-occl-${PORT}`, 'about:blank',
], { stdio: 'ignore' });

let ws; let seq = 0; const pending = new Map();
const callTimeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('cdp-timeout')), ms));
async function connect() {
  for (let i = 0; i < 60 && !ws; i++) {
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
    if (m.method === 'Page.javascriptDialogOpening') {
      // A click can raise a permission/alert dialog; auto-dismiss so Runtime.evaluate
      // is never stalled (that is what made the first run of this script die).
      send('Page.handleJavaScriptDialog', { accept: false }).catch(() => {});
      return;
    }
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  });
}
const send = (method, params = {}) => Promise.race([
  new Promise((res) => { const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); }),
  callTimeout(20000).catch(() => ({ __timeout: true })),
]);
const evaluate = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  if (r && r.__timeout) return { __err: 'cdp-timeout' };
  if (r?.result?.exceptionDetails) return { __err: r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text };
  return r?.result?.result?.value;
};

// Measure the state of one probe point: the control's own box, the stage box,
// and the real paint stack at the control's centre.
const PROBE = (sel, label) => `(() => {
  const e = document.querySelector(${JSON.stringify(sel)});
  const vp = document.querySelector('#viewportStage');
  const d = (n) => { if (!n) return 'null'; const r = n.getBoundingClientRect(); const cs = getComputedStyle(n);
    return n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + '.' + String(n.className || '').slice(0, 26) +
      '[' + Math.round(r.x) + ',' + Math.round(r.y) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ']' +
      ' pos=' + cs.position + ' z=' + cs.zIndex + ' pe=' + cs.pointerEvents; };
  if (!e) return { label: ${JSON.stringify(label)}, missing: true };
  e.scrollIntoView({ block: 'center' });
  const r = e.getBoundingClientRect();
  const x = Math.round(r.x + r.width / 2), y = Math.round(r.y + r.height / 2);
  const list = document.elementsFromPoint(x, y) || [];
  const own = (n) => !!(n && (n === e || e.contains(n) || n.contains(e)));
  return {
    label: ${JSON.stringify(label)}, sel: ${JSON.stringify(sel)},
    viewport: innerWidth + 'x' + innerHeight, scrollY: Math.round(scrollY),
    docH: Math.round(document.documentElement.scrollHeight),
    bodyClass: document.body.className, stageClass: vp ? vp.className : null,
    stage: d(vp), control: d(e), at: [x, y],
    stageCoversPoint: !!(vp && (function () { const sr = vp.getBoundingClientRect();
      return x >= sr.x && x <= sr.x + sr.width && y >= sr.y && y <= sr.y + sr.height; })()),
    hitTop: d(list[0]), selfTop: own(list[0]), inStack: list.some(own),
    stack: list.slice(0, 5).map(d),
  };
})()`;

const CLICK = (sel) => `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return 'missing'; e.scrollIntoView({ block: 'center' }); e.click(); return 'clicked'; })()`;

const POINTS = [
  ['[data-key="back"]', 'dpad-back'],
  ['[data-key="power"]', 'dpad-power'],
  ['#typerInput', 'typerInput'],
  ['#prefResolution', 'prefResolution'],
  ['#btnScanPorts', 'btnScanPorts'],
];

async function snapshot(state) {
  console.log(`\n===== STATE: ${state} =====`);
  console.log(`stamps: ${JSON.stringify(await evaluate('(() => ({ vp: innerWidth + "x" + innerHeight, scrollY: Math.round(scrollY), body: document.body.className, stage: (document.querySelector("#viewportStage")||{}).className || null }))()'))}`);
  for (const [sel, label] of POINTS) {
    const r = await evaluate(PROBE(sel, label));
    if (!r || typeof r !== 'object' || r.__err || r.missing) {
      console.log(`  ${label.padEnd(14)} probe=${!r ? 'undefined' : (r.__err ? 'ERR:' + r.__err : 'missing')}`);
      continue;
    }
    console.log(`  ${label.padEnd(14)} stageCovers=${r.stageCoversPoint} selfTop=${r.selfTop} inStack=${r.inStack} at=${JSON.stringify(r.at)}`);
    console.log(`      stage  ${r.stage}`);
    console.log(`      ctrl   ${r.control}`);
    console.log(`      top    ${r.hitTop}`);
    console.log(`      stack  ${JSON.stringify(r.stack)}`);
  }
}

try {
  await connect();
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate', { url: BASE + ROUTE });
  await sleep(2500);
  await snapshot('S0 fresh load, no interaction');
  for (const step of ['#btnFullscreenCanvas', '#btnFullscreenCanvas']) {
    const r = await evaluate(CLICK(step));
    await sleep(700);
    await snapshot(`after click ${step} -> ${r}`);
  }
} finally {
  try { ws && ws.close(); } catch {}
  try { chrome.kill('SIGKILL'); } catch {}
}
